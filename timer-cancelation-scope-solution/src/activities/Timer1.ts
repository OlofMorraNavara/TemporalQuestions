import { sleep, log } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

export const Timer1 = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: Timer1`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: Timer1`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        await sleep(ctx._generated.__TimerDuration1);
        ctx._generated.Timer1Timeout = true;
        return ctx;
    },
});
