// @@@SNIPSTART typescript-continue-as-new-workflow
import { log, proxyActivities } from '@temporalio/workflow';
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

export async function workflowOption1(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input
    }

    ctx = await A(ctx);
    let shouldBreak = false;
    do {
        ctx = await B(ctx);

        if (c1(ctx)) {
            let shouldBreak2 = false;
            do {
                ctx = await C(ctx);
                if (c2(ctx)) {
                    ctx = await E(ctx);
                    shouldBreak = true;
                    shouldBreak2 = true;
                } else {
                    ctx = await A(ctx);
                }
            } while (!shouldBreak2);
        }

        else {
            ctx = await D(ctx);
            if (c3(ctx)) {
                ctx = await F(ctx);
                shouldBreak = true;
            } else {

            }
        }
    } while (!shouldBreak);


    return ctx;
}

export async function workflowOption2(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input
    }

    let loop1 = false;
    do {
        loop1 = false;
        ctx = await A(ctx);

        let loop2 = false;
        do {
            loop2 = false;
            ctx = await B(ctx);
            if (!c1(ctx)) {
                ctx = await D(ctx);
                loop2 = !c3(ctx);

                if (!loop2) {
                    ctx = await F(ctx);
                }
            }
        } while (loop2); // c3

        if (c1(ctx)) {
            ctx = await C(ctx);
            loop1 = !c2(ctx);

            if(!loop1) {
                ctx = await E(ctx);
            }
        }
    } while (loop1); // c2

    return ctx;
}

enum StateMachineActivities {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
    F = 'F',
    exit = 'exit',
}

export async function workflowOption3(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input
    }

    let nextActivity: StateMachineActivities = StateMachineActivities.A;

    while (nextActivity !== StateMachineActivities.exit) {
        switch (nextActivity) {
            case 'A':
                ctx = await A(ctx);
                nextActivity = StateMachineActivities.B;
                break;
            case 'B':
                ctx = await B(ctx);
                if (c1(ctx)) {
                    nextActivity = StateMachineActivities.C;
                } else {
                    nextActivity = StateMachineActivities.D;
                }
                break;
            case 'C':
                ctx = await C(ctx);
                if (c2(ctx)) {
                    nextActivity = StateMachineActivities.F;
                } else {
                    nextActivity = StateMachineActivities.A;
                }
                break;
            case 'D':
                ctx = await D(ctx);
                if (c3(ctx)) {
                    nextActivity = StateMachineActivities.E;
                } else {
                    nextActivity = StateMachineActivities.B;
                }
                break;
            case 'E':
                ctx = await E(ctx);
                nextActivity = StateMachineActivities.exit;
                break;
            case 'F':
                ctx = await F(ctx);
                nextActivity = StateMachineActivities.exit;
                break;
            default:
                throw new Error('Unknown activity');
        }
    }

    return ctx;
}

export async function workflowOption4(input: WorkflowInput): Promise<WorkflowOutput> {
    log.info('Running Workflow with input', {input});
    let ctx: WorkflowContext = {
        ...input
    }

    ctx = await gotoA(ctx);

    return ctx;
}

async function gotoA(input: WorkflowInput): Promise<WorkflowOutput> {
    log.info('Running Workflow with input', {input});
    let ctx: WorkflowContext = {
        ...input
    }

    ctx = await A(ctx);
    return await gotoB(ctx);
}

async function gotoB(input: WorkflowContext): Promise<WorkflowContext> {
    let ctx: WorkflowContext = {
        ...input
    }

    ctx = await B(ctx);

    if (c1(ctx)) {
        ctx = await C(ctx);

        if (c2(ctx)) {
            ctx = await E(ctx);
        } else {
            return await gotoA(ctx);
        }
    } else {
        ctx = await D(ctx);

        if (c3(ctx)) {
            ctx = await F(ctx);
        } else {
            return await gotoB(ctx);
        }
    }

    return ctx;
}

// @@@SNIPEND
