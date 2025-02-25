import { WorkflowContext } from '../types/context';

export function createActivity({
    inputDataMapper,
    outputDataMapper,
    run,
    initiated,
    completed,
}: {
    inputDataMapper?: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    outputDataMapper?: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    run: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    initiated: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    completed: (ctx: WorkflowContext) => Promise<WorkflowContext>;
}) {
    return async function (ctx: WorkflowContext) {
        ctx = await initiated(ctx);
        if (inputDataMapper != null) {
            ctx = await inputDataMapper(ctx);
        }
        ctx = await run(ctx);
        if (outputDataMapper != null) {
            ctx = await outputDataMapper(ctx);
        }
        ctx = await completed(ctx);
        return ctx;
    };
}
