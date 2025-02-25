import { sleep, log } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

export const Extra1 = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: Extra1`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: Extra1`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        ctx._generated.extra1 = true;
        await sleep(10000);
        return ctx;
    },
});
