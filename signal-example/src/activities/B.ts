import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function B(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}B`;
    await sleep(10000);
    return ctx;
}