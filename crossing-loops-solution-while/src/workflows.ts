// @@@SNIPSTART typescript-continue-as-new-workflow
import { log, proxyActivities } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const {A, B, D, E, F, G} = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

function c1(ctx: WorkflowContext) {
    return ctx.name === '1AB' || ctx.name === '2AB' || ctx.name === '1ABDABEB';
}

function c2(ctx: WorkflowContext) {
    return ctx.name === '1ABDABEBD';
}

function c3(ctx: WorkflowContext) {
    return ctx.name === '2ABDABEBE';
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
                ctx = await D(ctx);
                if (c2(ctx)) {
                    ctx = await F(ctx);
                    shouldBreak = true;
                    shouldBreak2 = true;
                } else {
                    ctx = await A(ctx);
                }
            } while (!shouldBreak2);
        }

        else {
            ctx = await E(ctx);
            if (c3(ctx)) {
                ctx = await G(ctx);
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
                ctx = await E(ctx);
                loop2 = !c3(ctx);

                if (!loop2) {
                    ctx = await G(ctx);
                }
            }
        } while (loop2); // c3

        if (c1(ctx)) {
            ctx = await D(ctx);
            loop1 = !c2(ctx);

            if(!loop1) {
                ctx = await F(ctx);
            }
        }
    } while (loop1); // c2

    return ctx;
}

export async function workflowOption3(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input
    }

    let nextEvent: 'A' | 'B' | 'D' | 'E' | 'F' | 'G' = 'A';

    while (true) {
        switch (nextEvent) {
            case 'A':
                ctx = await A(ctx);
                nextEvent = 'B';
                break;
            case 'B':
                ctx = await B(ctx);
                if (c1(ctx)) {
                    nextEvent = 'D';
                } else {
                    nextEvent = 'E';
                }
                break;
            case 'D':
                ctx = await D(ctx);
                if (c2(ctx)) {
                    nextEvent = 'F';
                } else {
                    nextEvent = 'A';
                }
                break;
            case 'E':
                ctx = await E(ctx);
                if (c3(ctx)) {
                    nextEvent = 'G';
                } else {
                    nextEvent = 'B';
                }
                break;
            case 'F':
                ctx = await F(ctx);
                return ctx;
            case 'G':
                ctx = await G(ctx);
                return ctx;
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
        ctx = await D(ctx);

        if (c2(ctx)) {
            ctx = await F(ctx);
        } else {
            return await gotoA(ctx);
        }
    } else {
        ctx = await E(ctx);

        if (c3(ctx)) {
            ctx = await G(ctx);
        } else {
            return await gotoB(ctx);
        }
    }

    return ctx;
}

// @@@SNIPEND
