import { sleep, log } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

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
        await sleep(11000);
        ctx._generated.inkomendDocument = true;
        return ctx;
    },
});
