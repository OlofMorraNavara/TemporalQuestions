import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function C(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}C`;
    await sleep(1000);
    return ctx;
}