import { WorkflowContext } from '../types/context';
import { sleep } from '@temporalio/activity';

export async function A(ctx: WorkflowContext): Promise<WorkflowContext> {
    ctx.name = `${ctx.name}A`;
    return Promise.resolve(ctx);
}