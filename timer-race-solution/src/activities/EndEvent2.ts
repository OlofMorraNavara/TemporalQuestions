import { log } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

export const EndEvent2 = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: endEvent2`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: endEvent2`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        return ctx;
    },
});
