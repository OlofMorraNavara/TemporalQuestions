import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function E(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}E`;
    await sleep(1000);
    return ctx;
}