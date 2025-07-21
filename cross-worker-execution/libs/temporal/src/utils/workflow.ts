import merge from 'lodash/merge';
import { z } from 'zod';
import { ChildWorkflowFailure, type Duration, type SignalDefinition } from '@temporalio/common';
import {
    ActivityFailure,
    type ActivityOptions,
    ApplicationFailure,
    type ChildWorkflowOptions,
    condition,
    defineSignal,
    executeChild,
    log,
    ParentClosePolicy,
    patched,
    scheduleActivity,
    scheduleLocalActivity,
    setHandler,
    sleep,
    startChild,
    uuid4,
    workflowInfo,
} from '@temporalio/workflow';
import { publishWorkflowAlertActivity } from '../activities/publish-workflow-alert.activity.definition';
import { recordValueInHistoryActivityType } from '../activities/record-value-in-history.activity';
import {
    type ActivitiesOf,
    type ActivityDefinition,
    type ActivityInput,
    type ActivityOutput,
    type Workflow,
    type WorkflowDefinition,
    type WorkflowExecution,
    type WorkflowImplementation,
} from '../definitions';

type WorkflowPayload<TInput> = {
    /**
     * The unique identifier of the child workflow.
     * This must be unique value for each child workflow execution.
     *
     * If not defined, will use random uuid v4 ({@link uuid4}).
     */
    workflowId?: string;
    /**
     * The input for the child workflow.
     */
    input: TInput;
};

const mapInputArgs = <T>(input: T): T[] => (input !== undefined ? [input] : []);

export const getWorkflowOptions = <TInput>(
    definition: WorkflowDefinition<TInput, any>,
    payload: WorkflowPayload<NoInfer<TInput>>
): {
    args: [input: TInput];
    taskQueue: string | undefined;
    workflowId: string;
} => ({
    args: mapInputArgs(payload.input) as [input: TInput],
    taskQueue: definition.taskQueue,
    workflowId: payload.workflowId ?? uuid4(),
});

export function isZodError(err: unknown): err is z.ZodError {
    return Boolean(err && (err instanceof z.ZodError || (err as z.ZodError).name === 'ZodError'));
}

export type ManualActivityErrorSignalResponse = { action: 'retry' | 'abort' };

export const manualActivityErrorSignal = defineSignal<[ManualActivityErrorSignalResponse]>('manualActivityErrorSignal');

type ManualIntervationNeededOnActivityFailureFn = (
    error: Error,
    context: {
        /**
         * The attempt of workflow scheduling the activity
         */
        attempt: number;
        activityOptions: ActivityOptions;
    }
) => boolean | Promise<boolean>;

export type ActivityExecuteOptions = Partial<{
    /**
     * This setting will fail the activity when it doesn't complete after the specified {@link Duration}.
     */
    timeout: Duration;
    manualInterventionNeededOnActivityFailure: ManualIntervationNeededOnActivityFailureFn;
}>;

/**
 * Only create manual intervention when the activity failed with zod error.
 */
const defaultManualInterventionNeeded: ManualIntervationNeededOnActivityFailureFn = (error: Error) =>
    'type' in error && error.type === 'ZodError';

export const testingQueueName = 'testingQueue';

export class UnreachableCodeError extends Error {
    readonly name = 'UnreachableCodeErrorException';

    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, UnreachableCodeError.prototype);
    }
}

export class WorkflowInvariantError extends Error {
    readonly name = 'InvariantErrorException';

    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, WorkflowInvariantError.prototype);
    }
}

/**
 * Creates an workflow invariant error.
 * Useful when a workflow reaches an unknown state.
 */
export function invariantException(reason: string) {
    log.error(`Invariant error: ${reason}`);

    return new WorkflowInvariantError(reason);
}

/**
 * Creates an unreachabe code error.
 * Useful when a workflow reaches a `never` state according to type check.
 */
export function unreachableCodeException(x: never, message: string) {
    log.error(`UnreachableCode error: ${message}`, x);

    return new UnreachableCodeError(message ?? 'Unreachable code reached');
}

/**
 * Registers a signal and provides a `wait` method to wait for the signal to be received.
 *
 * @example
 * ```ts
 * const definedSignal = defineSignal<[MyType]>('signalName');
 * const signal = registerSignal(definedSignal);
 * const response = await signal.wait()
 * ```
 */
export const registerSignal = <TResult>(signal: SignalDefinition<[TResult], string>) => {
    let state: { received: true; result: TResult } | { received: false } = {
        received: false,
    };

    setHandler(signal, (signalValue: TResult) => {
        state = {
            received: true,
            result: signalValue,
        };
    });

    return {
        wait: async () => {
            await condition(() => state.received);
            const result = (state as Extract<typeof state, { received: true }>).result;
            // ensure we wait for a new signal value next time we call the wait method
            state = {
                received: false,
            };
            return result;
        },
    };
};

/**
 * Options that will be used when the task queue is {@link testingQueueName}
 */
const testingActivityOptions: ActivityOptions = {
    taskQueue: testingQueueName,
    scheduleToStartTimeout: '2 seconds',
    retry: {
        initialInterval: 100,
        backoffCoefficient: 1,
        maximumAttempts: 1,
    },
};

const mapExecutionOptionsToActivityOptions = (executionOptions: ActivityExecuteOptions): ActivityOptions => ({
    scheduleToCloseTimeout: executionOptions.timeout,
});

/**
 * Creates final activity options that will be used to schedule the activity.
 * if `taskQueue` equals {@link testingQueueName}, all the options from {@link testingActivityOptions} will be leading.
 */
const createActivityScheduleOptions = (
    taskQueue: string,
    definitionOptions: ActivityOptions,
    executionOptions: ActivityExecuteOptions
): ActivityOptions =>
    merge(
        // use new object since this object will be mutated
        {
            taskQueue,
        } satisfies ActivityOptions,
        definitionOptions,
        mapExecutionOptionsToActivityOptions(executionOptions),
        taskQueue === testingQueueName ? testingActivityOptions : {}
    );

const execActivity = async <TInput, TOutput>(
    activityDefinition: ActivityDefinition<string, TInput, TOutput>,
    input: NoInfer<TInput>,
    options: ActivityExecuteOptions = {}
): Promise<TOutput> => {
    const contextInfo = workflowInfo();

    const activityInput = mapInputArgs(input);
    const activityOptions = createActivityScheduleOptions(contextInfo.taskQueue, activityDefinition.options, options);

    return scheduleActivity<TOutput>(activityDefinition.activityName, activityInput, activityOptions);
};

const createWorkflowAlertInput = (error: Error) => ({
    alertName: 'workflow-exception' as const,
    payload: {
        errorData: {
            stack: error.stack,
            cause: error.cause,
            ...error,
            message: error.message,
            name: error.name,
        },
    },
});

/**
 * Starts an activity execution and waits for the result.
 *
 * If the activity fails, the `options.manualInterventionNeededOnActivityFailure` (default {@link defaultManualInterventionNeeded}) will be called to check if manual intervention is needed.
 * If manual intervention is needed, the workflow will call the {@link publishWorkflowAlertActivity} activity
 * and wait for the {@link manualInterventionSignal} to continue.
 *
 */
export const executeActivity = async <TInput, TOutput>(
    activityDefinition: ActivityDefinition<string, TInput, TOutput>,
    input: NoInfer<TInput>,
    options: ActivityExecuteOptions = {}
) => {
    const contextInfo = workflowInfo();
    const activityOptions = createActivityScheduleOptions(contextInfo.taskQueue, activityDefinition.options, options);

    const manualInterventionFn: ManualIntervationNeededOnActivityFailureFn =
        options.manualInterventionNeededOnActivityFailure ?? defaultManualInterventionNeeded;
    const manualInterventionSignal = registerSignal(manualActivityErrorSignal);

    let attempt = 0;
    while (true) {
        try {
            attempt++;
            return await execActivity(activityDefinition, input, options);
        } catch (activityError) {
            if (activityError instanceof ActivityFailure) {
                const causeError = activityError.cause;

                const shouldHaveManualIntervention =
                    !!causeError &&
                    (await manualInterventionFn(causeError, {
                        activityOptions,
                        attempt,
                    }));

                // rethrow the original error if no manual intervention is needed
                if (!shouldHaveManualIntervention) {
                    throw activityError;
                }

                await execActivity(publishWorkflowAlertActivity, createWorkflowAlertInput(activityError));

                const signalResult = await manualInterventionSignal.wait();

                if (signalResult.action === 'retry') {
                    continue;
                }

                // if this is reached, it means we decided to abort
                throw ApplicationFailure.fromError(causeError, { nonRetryable: true });
            }
        }
    }
};

async function triggerManualWorkflowFailure(error: Error): Promise<never> {
    await execActivity(publishWorkflowAlertActivity, createWorkflowAlertInput(error));

    // 1 week time to restart/retry this workflow
    await sleep('1 week');

    throw ApplicationFailure.fromError(error, { nonRetryable: true });
}

/**
 * Records a value into the workflow history using an (local) activity. Calling this will break determinsm if existing running workflows are not patched.
 * **Note**: It is important that the worker running this workflow should register the {@link recordValueInHistoryActivityType} activity.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const recordValueInHistory = async <T extends Record<string, any>>(value: T): Promise<T> => {
    const result = await scheduleLocalActivity<{
        value: T;
    }>(recordValueInHistoryActivityType, [value], {
        // should be more than enough since it is a local activity
        scheduleToCloseTimeout: '30s',
    });

    return result.value;
};

/**
 * Create a workflow execution with a context, which can be used to change behaviour of a workflow without breaking determinism.
 *
 * **Note**: It is important that the worker running this workflow should register the {@link recordValueInHistoryActivityType} activity.
 */
export const createContextExecution = <
    TInput,
    TOutput,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TContext extends Record<string, any>
>(params: {
    context: (input: NoInfer<TInput>) => TContext;
    execution: WorkflowExecution<TInput, TOutput, NoInfer<TContext>>;
}): WorkflowExecution<TInput, TOutput, TContext> =>
    async function contextExecution(input) {
        let contextResult: TContext = {} as TContext;
        // use a patch to make all current running workflows backwards compatible. However this means that TContext will be empty ({}) for existing workflows.
        if (patched('injectWorkflowContext') && params.context) {
            contextResult = (await recordValueInHistory(params.context(input))) ?? contextResult;
        }

        return params.execution(input, contextResult);
    };

/**
 * Create a workflow execution from a workflow definition.
 */
export const createWorkflow = <TInput, TOutput, TContext>(
    definition: WorkflowDefinition<TInput, TOutput>,
    execution: WorkflowExecution<TInput, NoInfer<TOutput>, TContext>
): WorkflowImplementation<TInput, TOutput> =>
    createBareWorkflow(definition, async function execute(input) {
        /**
         * When an workflow execution throws, depending on the type of error a manual workflow failure is triggered.
         * Manual workflow failure will send alert, sleep the workflow and throw an non-retryable application error if the workflow is not resetted manually.
         * The following errors will trigger manual workflow failure:
         *  - Uncaught ActivityFailure
         *  - Data validation (Zod)
         *  - UnreachableCodeError
         *  - InvariantError
         *
         * In other cases (ApplicationFailure, TypeError, etc) the original error is rethrown:
         */
        return execution(input, {} as TContext).catch(async (error: unknown) => {
            log.error('Workflow failure caught', { error });
            if (
                error instanceof ActivityFailure ||
                isZodError(error) ||
                error instanceof UnreachableCodeError ||
                error instanceof WorkflowInvariantError ||
                error instanceof ChildWorkflowFailure
            ) {
                return triggerManualWorkflowFailure(error);
            }

            throw error;
        });
    });

/**
 * Create a bare workflow that simply executes the provided execution function and does not have any additional behaviour
 */
export const createBareWorkflow = <TInput, TOutput>(
    definition: WorkflowDefinition<TInput, TOutput>,
    execution: WorkflowExecution<TInput, NoInfer<TOutput>, Record<never, string>>
): WorkflowImplementation<TInput, TOutput> => {
    const result: WorkflowImplementation<TInput, TOutput> = (input) => execution(input, {});
    // bind workflow definition to function. Useful when we need to access the definition during runtime.
    result.workflowDefinition = definition;
    return result;
};

/**
 * Start a child Workflow execution from an workflow and await its completion.
 *
 * - By default, a child will be scheduled on the same task queue as its parent.
 * - This operation is cancellable using {@link CancellationScope}.
 *
 * @return The result of the child Workflow.
 */
export const executeChildWorkflow = <TInput, TOutput>(
    definition: WorkflowDefinition<TInput, TOutput>,
    payload: WorkflowPayload<NoInfer<TInput>>,
    options?: Omit<ChildWorkflowOptions, 'workflowId'>
) => {
    const childWorkflowOptions = getWorkflowOptions(definition, payload);

    return executeChild<Workflow<TInput, TOutput>>(definition.workflowName, {
        ...childWorkflowOptions,
        ...options,
    });
};

/**
 * Start a child Workflow execution from an workflow and don't await its completion.
 *
 * - By default, a child will be scheduled on the same task queue as its parent.
 * - This operation is cancellable using {@link CancellationScope}.
 * - The `parentClosePolicy` is by default {@link ParentClosePolicy.ABANDON}
 *
 * @return The result of the child Workflow.
 */
export const startAsyncChildWorkflow = <TInput, TOutput>(
    definition: WorkflowDefinition<TInput, TOutput>,
    payload: WorkflowPayload<NoInfer<TInput>>,
    options?: Omit<ChildWorkflowOptions, 'workflowId'>
) => {
    const childWorkflowOptions = getWorkflowOptions(definition, payload);

    return startChild<Workflow<TInput, TOutput>>(definition.workflowName, {
        parentClosePolicy: ParentClosePolicy.ABANDON,
        ...childWorkflowOptions,
        ...options,
    });
};

/**
 * Maps a workflow to an activity using the workflows name as the activity name.
 */
export const workflowToActivity = <TInput, TOuput>(
    workflowDefinition: WorkflowDefinition<TInput, TOuput>,
    payload: WorkflowPayload<TInput>,
    activityOptions: ActivityOptions
) => scheduleActivity(workflowDefinition.workflowName, mapInputArgs(payload), activityOptions);

/**
 * For each workflowDefinition in `workflowDefinitions`, create a new one that has one activity with the same name for testing purposes.
 *
 * **NOTE**: ONLY USE THIS FOR MOCKING WORKFLOWS AS ACTIVITIES.
 * This is useful for mocking workflows as activities and can be used when a workflow has child workflows.
 */
export const workflowsToActivities = (
    workflowDefinitions: Array<WorkflowDefinition<any, any>>,
    activityOptions?: ActivityOptions
) => {
    const optionsForActivities = merge(
        {
            // keep the default low so the tests fail fast
            startToCloseTimeout: '3 seconds',
            retry: {
                maximumAttempts: 3,
            },
        },
        activityOptions
    );

    return workflowDefinitions.reduce((agg, workflowDefinition) => {
        async function workflowFn(input: unknown) {
            const { workflowId } = workflowInfo();
            return workflowToActivity(
                workflowDefinition,
                {
                    workflowId,
                    input,
                },
                optionsForActivities
            );
        }

        agg[workflowDefinition.workflowName] = workflowFn;
        return agg;
    }, {} as Record<string, Workflow<any, any>>);
};

type Prettify<T> = {
    [K in keyof T]: T[K];
} & unknown;

type CallableActivity<TInput, TOutput> = (
    input: Prettify<NoInfer<TInput>>,
    options?: ActivityExecuteOptions
) => Promise<TOutput>;

type CallableActivities<TActivities extends Record<string, ActivityDefinition<string, any, any>>> = {
    [K in keyof TActivities]: CallableActivity<ActivityInput<TActivities[K]>, ActivityOutput<TActivities[K]>>;
};

export type InferCallableActivities<T> = T extends CallableActivities<infer I> ? ActivitiesOf<I> : never;

/**
 * Creates a record of callable activities from a record of activity definitions.
 */
export const createCallableActivities = <TActivities extends Record<string, ActivityDefinition<string, any, any>>>(
    activities: TActivities
): CallableActivities<TActivities> =>
    Object.entries(activities).reduce((agg, [property, activityDefinition]) => {
        agg[property as keyof TActivities] = function execute(input, options) {
            return executeActivity(activityDefinition, input, options);
        };
        return agg;
    }, {} as CallableActivities<TActivities>);
