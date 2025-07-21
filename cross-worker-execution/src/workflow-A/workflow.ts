// @@@SNIPSTART cross-worker-execution/workflow-A
import { log, proxyActivities, uuid4 } from '@temporalio/workflow';
import { executeChildWorkflow, defineWorkflow } from '@integration/temporal';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

// Type imports for workflow definition
import {
    WorkflowInput as HelperWorkflowInput,
    WorkflowOutput as HelperWorkflowOutput,
} from '../../libs/subflow-conductor-caller/context';
import { WorkflowInput as SubflowInput, WorkflowOutput as SubflowOutput } from './subflows/workflowB/context';

const { start, callSubflow, end } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

export const workflowBDefinition = defineWorkflow<
    HelperWorkflowInput<SubflowInput>,
    HelperWorkflowOutput<SubflowOutput>
>({
    workflowName: 'workflowB',
});

export async function workflowA(input: WorkflowInput): Promise<WorkflowOutput> {
    log.info('Running Workflow with input', { input });
    let ctx: WorkflowContext = {
        ...input,
    };

    // Start Activity
    ctx = await start(ctx);

    // Call Subflow Activity
    ctx = await callSubflow(ctx);

    const output = await executeChildWorkflow(
        workflowBDefinition,
        {
            workflowId: uuid4(),
            input: {
                runtimeIdentifier: 'test',
                timeout: 500,
                subflowInput: {
                    name: 'input to subflow',
                },
            },
        },
        {
            taskQueue: 'process-group-2',
        }
    );

    console.log('Subflow output:', output);

    // End Activity
    ctx = await end(ctx);

    return ctx;
}
// @@@SNIPEND
