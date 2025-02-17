import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function A(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}A`;
    await sleep(10000);
    return Promise.resolve(ctx);
}