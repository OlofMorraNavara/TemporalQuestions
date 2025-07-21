import { randomUUID } from 'crypto';
import { useTemporalTestEnvironment } from '@integration/temporal/temporal-testing';
import { defineWorkflow } from '@integration/temporal';
import { afterAll, beforeAll, describe, expect } from '@jest/globals';
import { getLocationDefinition } from '../activities/get-location/get-location.activity.definition';
import { runTemporalDefinition } from '../activities/run/run-temporal.activity.definition';
import { Location, LocationTemporal, WorkflowContext, WorkflowInput, WorkflowOutput } from '../context';
import { getResultsTemporalDefinition } from '../activities/get-results/get-results-temporal.activity.definition';

jest.mock('axios');

const taskQueue = 'subflow-conductor-test';

let testEnv: Awaited<ReturnType<typeof useTemporalTestEnvironment>>;
let execute: (typeof testEnv)['execute'];

type SubflowInput = {
    a: string;
    b: boolean;
    c: number;
};

type SubflowOutput = {
    x: string;
    y: boolean;
    z: number;
};

// For every call to the subflow-conductor-caller, we need to define the workflow with the input and output types of the subflow
export const SubflowConductorCallerProcessDefinition = defineWorkflow<
    WorkflowInput<SubflowInput>,
    WorkflowOutput<SubflowOutput>
>({
    workflowName: 'subflowConductorCaller',
});

describe('subflow-conductor-caller', () => {
    beforeAll(async () => {
        testEnv = await useTemporalTestEnvironment({
            workflowsPath: require.resolve('./subflow-conductor-caller'),
            tsConfigFile: require('path').resolve(process.cwd(), 'tsconfig.json'),
        });

        execute = testEnv.execute;
    });

    // Known problem: see https://github.com/temporalio/sdk-typescript/issues/928#issuecomment-1921490918 for more info and possible solutions
    afterAll(async () => {
        await testEnv.tearDown();
    });

    let ctx: WorkflowContext<SubflowInput, SubflowOutput> = {
        runtimeIdentifier: 'subflow-to-start',
        timeout: 500,
        subflowInput: { a: 'test', b: true, c: 42 },
        conductorUrl: 'http://localhost:8080',
        mainFlowDone: false,
        location: {
            type: 'TEMPORAL',
            workflowId: '1234',
            taskQueue: taskQueue,
            name: 'name',
        },
    };

    let result: WorkflowOutput<SubflowOutput> = {
        subflowOutput: { x: 'result', y: false, z: 100 },
    };

    it('should succeed calling the conductor with mocked subflow', async () => {
        const location = ctx.location as LocationTemporal;

        const mockedActivities = {
            [getLocationDefinition.activityName]: jest.fn().mockResolvedValue(location),
            [runTemporalDefinition.activityName]: jest.fn().mockResolvedValue(location.workflowId),
            [getResultsTemporalDefinition.activityName]: jest.fn().mockResolvedValue(result.subflowOutput),
        };

        await expect(
            execute(mockedActivities, SubflowConductorCallerProcessDefinition, {
                workflowId: randomUUID(),
                args: [
                    {
                        runtimeIdentifier: ctx.runtimeIdentifier,
                        timeout: ctx.timeout,
                        subflowInput: ctx.subflowInput,
                    },
                ],
            })
        ).resolves.toEqual({ subflowOutput: result.subflowOutput });
    }, 15000);
});
