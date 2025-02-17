import { log, proxyActivities } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';

const { A } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

function numberOfExecutionTimes(ctx: WorkflowContext) {
    return 14;
}

export async function cancellableWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input
    }

    for (let i = 0; i < numberOfExecutionTimes(ctx); i++) {
        ctx = await A(ctx);
    }

    return ctx;
}
