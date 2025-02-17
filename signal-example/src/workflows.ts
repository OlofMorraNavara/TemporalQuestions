// @@@SNIPSTART typescript-continue-as-new-workflow
import * as wf from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const {A, B, C} = wf.proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

export const unblockSignal = wf.defineSignal('unblock');
export const isBlockedQuery = wf.defineQuery<boolean>('isBlocked');

function c1(ctx: WorkflowContext) {
    wf.log.info('Checking condition c1', {ctx});
    return ctx.name.split('').every((c) => c === 'A' || c === 'B');
}

export async function loopingWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
    wf.log.info('Running Workflow with input', {input});
    let ctx: WorkflowContext = {
        ...input
    }

    let isBlocked = true;
    wf.setHandler(unblockSignal, () => void (isBlocked = false));
    wf.setHandler(isBlockedQuery, () => isBlocked);

    do {
        ctx = await A(ctx);
        ctx = await B(ctx);
        await wf.condition(() => isBlocked);
    } while (c1(ctx));

    ctx = await C(ctx);
    return ctx;
}

// @@@SNIPEND
