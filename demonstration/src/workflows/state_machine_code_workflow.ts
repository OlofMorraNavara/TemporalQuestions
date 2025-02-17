import { log, proxyActivities } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';

const { A, B, C, D, E, F } = proxyActivities<typeof activities>({
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

export async function stateMachineWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input
    }

    let nextEvent: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'A';

    while (true) {
        switch (nextEvent) {
            case 'A':
                ctx = await A(ctx);
                nextEvent = 'B';
                break;
            case 'B':
                ctx = await B(ctx);
                if (c1(ctx)) {
                    nextEvent = 'C';
                } else {
                    nextEvent = 'D';
                }
                break;
            case 'C':
                ctx = await C(ctx);
                if (c2(ctx)) {
                    nextEvent = 'E';
                } else {
                    nextEvent = 'A';
                }
                break;
            case 'D':
                ctx = await D(ctx);
                if (c3(ctx)) {
                    nextEvent = 'F';
                } else {
                    nextEvent = 'B';
                }
                break;
            case 'E':
                ctx = await E(ctx);
                return ctx;
            case 'F':
                ctx = await F(ctx);
                return ctx;
            default:
                throw new Error('Unknown activity');
        }
    }

    return ctx;
}
