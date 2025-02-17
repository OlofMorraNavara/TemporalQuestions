import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function A(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}A`;
    console.info('Activity A', { ctx });

    if (Math.random() < 0.5 && ctx.mayFail) {
        throw new Error('Activity A failed');
    }

    await sleep(1000);
    return Promise.resolve(ctx);
}