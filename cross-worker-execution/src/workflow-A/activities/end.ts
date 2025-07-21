import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function end(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}A`;
    await sleep(1000);
    return Promise.resolve(ctx);
}
