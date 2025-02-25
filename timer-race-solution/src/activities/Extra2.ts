import { sleep, log } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

export const Extra2 = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: Extra2`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: Extra2`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        ctx._generated.extra2 = true;
        await sleep(12000);
        return ctx;
    },
});
