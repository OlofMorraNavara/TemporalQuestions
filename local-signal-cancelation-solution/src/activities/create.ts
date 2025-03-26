import { WorkflowContext } from '../types/context';
import {heartbeat, sleep} from "@temporalio/activity";
import {CancelledFailure} from "@temporalio/client";

export function createActivity({
    inputDataMapper,
    outputDataMapper,
    run,
    initiated,
    completed,
    cancelled,
}: {
    inputDataMapper?: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    outputDataMapper?: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    run: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    initiated: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    completed: (ctx: WorkflowContext) => Promise<WorkflowContext>;
    cancelled?: (ctx: WorkflowContext) => Promise<WorkflowContext>;
}) {
    return async function (ctx: WorkflowContext) {
        try {
            await Promise.race([
                (async () => {
                    while(true) {
                        await sleep(10);
                        heartbeat();
                    }
                })(),
                (async () => {
                    ctx = await initiated(ctx);
                    if (inputDataMapper != null) {
                        ctx = await inputDataMapper(ctx);
                    }
                    ctx = await run(ctx);
                    if (outputDataMapper != null) {
                        ctx = await outputDataMapper(ctx);
                    }
                    ctx = await completed(ctx);
                })()
            ])
        }
        catch (err) {
            throw err
        }
        return ctx;
    };
}
