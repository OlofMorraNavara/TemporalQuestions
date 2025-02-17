import { log, proxyActivities } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';

const { A, B } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
        initialInterval: '5 seconds',
    }
});

export async function replayWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input
    }

    ctx.mayFail = true;

    console.log(`Replaying workflow ${ctx.name}`);
    ctx = await A(ctx);

    console.log(`Replayed workflow ${ctx.name}`);
    ctx = await B(ctx);

    return ctx;
}
