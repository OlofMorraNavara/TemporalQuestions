import { sleep, log } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

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
        await sleep(ctx._generated.__TimerDuration3);
        ctx._generated.Timer3Timeout = true;
        return ctx;
    },
});
