import { sleep, log } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

export const Timer2 = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: Timer2`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: Timer2`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        await sleep(ctx._generated.__TimerDuration2);
        ctx._generated.Timer2Timeout = true;
        return ctx;
    },
});
