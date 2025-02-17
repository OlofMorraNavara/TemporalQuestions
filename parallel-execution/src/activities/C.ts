import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function C(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}C`;
    await sleep(1000);
    throw new Error('Throw error after some ms to test error handling in parallel execution');

    return ctx;
}