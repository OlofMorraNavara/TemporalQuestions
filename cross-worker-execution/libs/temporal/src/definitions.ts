import merge from 'lodash/merge';
import { type ActivityOptions } from '@temporalio/workflow';

declare const inputSymbol: unique symbol;
declare const outputSymbol: unique symbol;

type InputType = typeof inputSymbol;
type OutputType = typeof outputSymbol;

type WorkflowSettings = {
    /**
     * Name of the workflow. This name should be used to register the workflow with the worker.
     */
    workflowName: string;
    /**
     * Optional task queue that the workflow should be scheduled on.
     * If not provided, a task queue will be determined by the invoker of the workflow.
     */
    taskQueue?: string;
};

export type Workflow<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

export type WorkflowExecution<TInput, TOutput, TContext> = (input: TInput, context: TContext) => Promise<TOutput>;

export type WorkflowDefinition<TInput, TOutput = void> = WorkflowSettings & {
    [inputSymbol]: TInput;
    [outputSymbol]: TOutput;
};

export type WorkflowInput<T extends WorkflowDefinition<any, any>> = T[InputType];
export type WorkflowOutput<T extends WorkflowDefinition<any, any>> = T[OutputType];
export type WorkflowOf<T extends WorkflowDefinition<any, any>> = Workflow<WorkflowInput<T>, WorkflowOutput<T>>;

/**
 * Defines a workflow with a given name and settings
 */
export const defineWorkflow = <TInput, TOutput = void>(
    settings: WorkflowSettings
): WorkflowDefinition<TInput, TOutput> => settings as WorkflowDefinition<TInput, TOutput>;

export interface WorkflowImplementation<TInput, TOutput> extends Workflow<TInput, TOutput> {
    workflowDefinition: WorkflowDefinition<TInput, TOutput>;
}

export type Activity<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

export type ActivityInput<TDef extends ActivityDefinition<string, any, any>> = TDef[typeof inputSymbol];
export type ActivityOutput<TDef extends ActivityDefinition<string, any, any>> = TDef[typeof outputSymbol];

export type ActivityDefinition<TName, TInput, TOutput> = {
    activityName: TName;
    options: ActivityOptions;
    [inputSymbol]: TInput;
    [outputSymbol]: TOutput;
};

export type DefinitionToActivity<TDef extends ActivityDefinition<string, any, any>> = Activity<
    ActivityInput<TDef>,
    ActivityOutput<TDef>
>;

export const defaultActivityOptions: ActivityOptions = {
    /**
     * Maximum time of an single activity execution attempt.
     * Should be a little bit higher than the expected request(s) timeout. This is to ensure that the activity is not closed before the request is finished.
     * Because of the nature of message driven systems, temporal server relies on this value to determine if an activity didn't complete in time.
     * Therefore, this timeout should be as close as possible as the longest possible activity execution time.
     */
    startToCloseTimeout: '45 seconds',
    retry: {
        initialInterval: '10 seconds',
        backoffCoefficient: 3,
        maximumInterval: '10 minutes',
        nonRetryableErrorTypes: ['ZodError'],
    },
};

/**
 * Defines an activity with a given name and options,
 *
 * By default {@link defaultActivityOptions} is used as a base for activity options.
 */
export const defineActivity =
    <TName extends string>(activityName: TName) =>
    <TInput, TOutput = void>(
        activityOptions: Omit<ActivityOptions, 'scheduleToCloseTimeout'> = {}
    ): ActivityDefinition<TName, TInput, TOutput> =>
        ({
            activityName,
            options: merge({}, defaultActivityOptions, activityOptions),
        } as ActivityDefinition<TName, TInput, TOutput>);

export type ActivityOf<TActivityDefinition extends ActivityDefinition<string, any, any>> = Activity<
    ActivityInput<TActivityDefinition>,
    ActivityOutput<TActivityDefinition>
>;

export type ActivitiesOf<TRecord extends Record<string, ActivityDefinition<string, any, any>>> = {
    [K in keyof TRecord as TRecord[K]['activityName']]: DefinitionToActivity<TRecord[K]>;
};

export declare const MockedActivityType: unique symbol;
export type MockedActivityType = {
    [MockedActivityType]: true;
};

export const brandMockedActivity = <T>(input: T): T & MockedActivityType => input as unknown as T & MockedActivityType;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BrandMockedActivities<T extends ActivitiesOf<any>> = {
    [K in keyof T]: T[K] & MockedActivityType;
};

export const brandMockedActivities = <TRecord extends Record<string, Activity<any, any>>>(
    activities: NoInfer<TRecord>
) => activities as BrandMockedActivities<TRecord>;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const emptyMockedActivity = brandMockedActivity(async () => {});

type IntersectUnion<T> = T extends T ? keyof T : never;
export const hasMockedActivities = <T extends Record<string, Activity<any, any>>>(
    _activities: T
): typeof MockedActivityType extends IntersectUnion<T[keyof T]> ? true : false => undefined as unknown as any;

/** Does nothing, but execute an assertion for us using the type system */
export const assertFalse = <T extends false>(_value?: T) => {
    //
};
