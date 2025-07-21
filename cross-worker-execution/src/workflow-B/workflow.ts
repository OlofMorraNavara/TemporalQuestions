// @@@SNIPSTART cross-worker-execution/workflow-A
import { log, proxyActivities } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const { start, end } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

export async function workflowB(input: WorkflowInput): Promise<WorkflowOutput> {
    log.info('Running Workflow with input', { input });
    let ctx: WorkflowContext = {
        ...input,
    };

    // Start Activity
    ctx = await start(ctx);

    // End Activity
    ctx = await end(ctx);

    return ctx;
}
// @@@SNIPEND
