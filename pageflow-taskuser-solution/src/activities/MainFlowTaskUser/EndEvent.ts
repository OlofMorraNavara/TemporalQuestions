import { log, sleep } from '@temporalio/activity';
import { createActivity } from '../create';
import { WorkflowContext } from '../../types/context';

export const EndEvent = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: endEvent`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: endEvent`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        await sleep(2000);
        return ctx;
    },
});
