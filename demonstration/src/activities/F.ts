import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function F(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}F`;
    await sleep(1000);
    return ctx;
}