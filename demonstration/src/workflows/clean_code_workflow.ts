import { log, proxyActivities } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';

const { A, B, C, D } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

function c1(ctx: WorkflowContext) {
    return ctx.name === '1A';
}

function c2(ctx: WorkflowContext) {
    return ctx.name === '1AB' || ctx.name === '1ABD' || ctx.name === '2AC' || ctx.name === '2ACD';
}

export async function cleanCodeWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
    log.info('Running Workflow with input', { input });
    let ctx: WorkflowContext = {
        ...input
    }

    ctx = await A(ctx);

    if (c1(ctx)) {
        ctx = await B(ctx);
    } else {
        ctx = await C(ctx);
    }

    do {
        ctx = await D(ctx);
    } while (c2(ctx))

    return ctx;
}
