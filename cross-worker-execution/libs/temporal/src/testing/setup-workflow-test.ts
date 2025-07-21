import * as path from 'node:path';
import { type DataConverter, type WorkflowResultType, type WorkflowStartOptions } from '@temporalio/client';
import * as temporalProtos from '@temporalio/proto';
import { type ClientOptionsForTestEnv, TestWorkflowEnvironment } from '@temporalio/testing';
import {
    type BundleOptions,
    DefaultLogger,
    type Logger,
    makeTelemetryFilterString,
    Runtime,
    Worker,
    type WorkerOptions,
} from '@temporalio/worker';
import { type ActivityFunction, type Workflow } from '@temporalio/workflow';
import { type WorkflowDefinition, type WorkflowOf } from '../definitions';
import { testingQueueName } from '../helpers';
import { bundleWorkflowForTesting } from './bundler';
import { WorkflowCoverage } from './workflow-coverage';

export type TemporalTestEnvironmentConfig = {
    tsConfigFile?: string;
    workflowsPath: string;
    disableTimeSkipping?: boolean;
    bundleOptions?: Omit<BundleOptions, 'workflowsPath'>;
    logger?: Logger;
    clientOptions?: ClientOptionsForTestEnv;
};

/**
 * @description creates a local Temporal environment for testing purposes
 */
async function createTestEnvironment(config: TemporalTestEnvironmentConfig) {
    const disableTimeSkipping = config.disableTimeSkipping ?? false;

    if (!Runtime.instance()) {
        Runtime.install({
            logger: config.logger,
            telemetryOptions: {
                logging: {
                    forward: {},
                    filter: makeTelemetryFilterString({ core: 'INFO', other: 'INFO' }),
                },
            },
        });
    }

    try {
        const env = await (async () => {
            if (disableTimeSkipping) {
                return TestWorkflowEnvironment.createLocal({
                    client: config.clientOptions,
                    server: {
                        extraArgs: ['--dynamic-config-value', 'system.forceSearchAttributesCacheRefreshOnRead=true'],
                    },
                });
            }

            return TestWorkflowEnvironment.createTimeSkipping({
                client: config.clientOptions,
            });
        })();

        await env.connection.operatorService.addSearchAttributes({
            namespace: 'default',
            // should be kept in sync with the "production" namespace for consistency
            searchAttributes: {
                accountId: temporalProtos.temporal.api.enums.v1.IndexedValueType.INDEXED_VALUE_TYPE_KEYWORD,
            },
        });

        return env;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error occured in creating the test environment, reason:', e);
        // eslint-disable-next-line no-console
        console.info('One of the solutions could be to disable zScaler and try to run the tests again');

        throw e;
    }
}

/**
 * Setup a Temporal test environment with coverage collection capabilities and provides methods to execute workflows.
 * This function is meant to be used in test files where temporal workflows are being tested.
 *
 * A caveat is that only workflow coverage is used as the final code coverage for this environment (per test file).
 * This can potentially reduce code coverage, however the impact should be really low and only visible if a test file contains workflow tests and non workflow related tests (testing utils etc).
 */

export async function useTemporalTestEnvironment(config: TemporalTestEnvironmentConfig) {
    config.logger = config.logger ?? new DefaultLogger('WARN');
    const tsConfigFile = config.tsConfigFile ?? path.join(__dirname, '../../tsconfig.spec.json');

    const workflowCoverage = new WorkflowCoverage();
    const bundle = await bundleWorkflowForTesting({
        ...config,
        tsConfigFile,
        workflowCoverageHelper: workflowCoverage,
    });

    let testEnv = await createTestEnvironment(config);

    async function createWorker(
        workerOptions: WorkerOptions & { taskQueue: string },
        activities: Record<string, ActivityFunction>
    ) {
        return Worker.create(
            workflowCoverage.augmentWorkerOptionsWithBundle({
                connection: testEnv.nativeConnection,
                debugMode: true,
                workflowBundle: bundle,
                ...workerOptions,
                activities,
            })
        );
    }

    async function executeWorkflow<T extends Workflow>(
        activities: Record<string, ActivityFunction>,
        workflowTypeOrFunc: string | T,
        startOptions: Omit<WorkflowStartOptions<T>, 'taskQueue'>
    ): Promise<WorkflowResultType<T>> {
        const taskQueue = testingQueueName;
        const worker = await createWorker({ taskQueue }, activities);

        // need to cast because typescript doesn't understand that the taskQueue is set
        const executeOptions = {
            ...startOptions,
            taskQueue,
        } as WorkflowStartOptions<T>;

        return worker.runUntil<WorkflowResultType<T>>(() =>
            testEnv.client.workflow.execute(workflowTypeOrFunc, executeOptions)
        );
    }

    async function tearDown() {
        return testEnv
            .teardown()
            .then(() => Runtime.instance().shutdown())
            .then(() => {
                // set the workflow coverage data as the collected coverage.
                (global as any).__coverage__ = workflowCoverage.popJestCoverageData((global as any).__coverage__);
            });
    }

    return {
        executeWorkflow,
        /**
         * Run the provided history.
         * Will resolve as soon as the history has finished being replayed, or if the workflow produces a nondeterminism error.
         *
         * @example
         * ```typescript
         * expect(replayHistory(history, { dataConverter:  })).resolves.toBe('expected result');
         * ```
         */
        async replayHistory(
            history: unknown,
            options?: {
                dataConverter?: DataConverter;
                /**
                 * If provided, use this as the workflow id during replay. Histories do not contain a workflow id, so it must be provided separately if your workflow depends on it.
                 */
                workflowId?: string;
                // if set to true, it will collect coverage data during replay. Defaults to false
                collectCoverage?: boolean;
            }
        ) {
            return Worker.runReplayHistory(
                {
                    workflowBundle: bundle,
                    dataConverter: options?.dataConverter,
                    sinks: workflowCoverage.getSinksForCoverage(),
                },
                history,
                options?.workflowId
            );
        },
        async execute<TDefinedWorkflow extends WorkflowDefinition<any, any>>(
            activities: Record<string, ActivityFunction>,
            definition: TDefinedWorkflow,
            options: Omit<WorkflowStartOptions<WorkflowOf<TDefinedWorkflow>>, 'taskQueue'>
        ) {
            return executeWorkflow(activities, definition.workflowName, options);
        },
        createWorker,
        getClient: () => testEnv.client,
        recreate: async () => tearDown().then(async () => (testEnv = await createTestEnvironment(config))),
        tearDown,
    };
}
