import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function F(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}G`;
    await sleep(1000);
    return ctx;
}