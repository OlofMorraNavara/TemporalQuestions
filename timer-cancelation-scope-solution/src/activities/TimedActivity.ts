import {sleep, log, heartbeat} from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';
import {CancelledFailure} from "@temporalio/workflow";

export const TimedActivity = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: TimedActivity`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: TimedActivity`);
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
                    await sleep(8000);
                })()
            ])
        }
        catch (err) {
            if (err instanceof CancelledFailure) {
                console.warn('Timed activity cancelled', { message: err.message });
            }
            throw err;
        }
        return ctx;
    },
});
