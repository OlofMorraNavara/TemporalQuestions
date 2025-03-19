import {sleep, log, heartbeat} from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';
import {CancelledFailure} from "@temporalio/workflow";

export const Timer3 = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: Timer3`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: Timer3`);
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
                    await sleep(ctx._generated.__TimerDuration3);
                })()
            ])
        }
        catch (err) {
            if (err instanceof CancelledFailure) {
                console.warn('Timer 3 cancelled', { message: err.message });
            }
            throw err;
        }
        ctx._generated.Timer3Timeout = true;
        return ctx;
    },
});
