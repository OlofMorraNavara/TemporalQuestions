import { heartbeat, log, sleep} from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';
import {CancelledFailure} from "@temporalio/client";

export const ToCancelActivity = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: ToCancelActivity`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: ToCancelActivity`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        try {
            await Promise.race([
                // Heartbeats
                (async () => {
                    while(true) {
                        await sleep(10);
                        heartbeat();
                    }
                })(),
                // Run logic
                (async () => {
                    for (let i = 0; i < 3; i++) {
                        console.warn('Run logic', {i});
                        await sleep(1000);
                    }
                })()
            ])
        }
        catch (err) {
            if (err instanceof CancelledFailure) {
                console.warn('Activity cancelled 1', { message: err.message });
                // TODO: Cancelled script.
            }
            throw err;
        }
        return ctx;
    },
});