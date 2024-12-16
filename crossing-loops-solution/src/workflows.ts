// @@@SNIPSTART typescript-continue-as-new-workflow
import { continueAsNew, sleep, log, proxyActivities, executeChild } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const {A, B, C, D, E, F} = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

function c1(ctx: WorkflowContext) {
    return ctx.name === '1AB' || ctx.name === '2AB' || ctx.name === '1ABCABDB';
}

function c2(ctx: WorkflowContext) {
    return ctx.name === '1ABCABDBC';
}

function c3(ctx: WorkflowContext) {
    return ctx.name === '2ABCABDBD';
}

export async function loopingWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
    log.info('Running Workflow with input', {input});
    let ctx: WorkflowContext = {
        ...input
    }

    ctx = await A(ctx);

    ctx = await executeChild(childWorkflowWithStartB, {args: [ctx]});

    return ctx;
}

export async function childWorkflowWithStartB(input: WorkflowContext): Promise<WorkflowContext> {
    let ctx: WorkflowContext = {
        ...input
    }

    ctx = await B(ctx);

    if (c1(ctx)) {
        ctx = await executeChild(childWorkflowWithStartD, {args: [ctx]});
    } else {
        ctx = await D(ctx);
        if (c3(ctx)) {
            ctx = await F(ctx);
        } else {
            ctx = await continueAsNew<typeof childWorkflowWithStartB>(ctx);
        }
    }

    return ctx;
}

export async function childWorkflowWithStartD(input: WorkflowContext): Promise<WorkflowContext> {
    let ctx = {
        ...input
    }

    ctx = await C(ctx);
    if (c2(ctx)) {
        ctx = await E(ctx);
    } else {
        // This becomes problematic I think? We execute a workflow as child, but this is also the root workflow
        ctx = await executeChild(loopingWorkflow, {args: [ctx]});
    }

    return ctx;
}

// @@@SNIPEND
