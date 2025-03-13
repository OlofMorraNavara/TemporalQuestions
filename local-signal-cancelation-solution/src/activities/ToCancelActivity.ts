import { log, sleep } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

export const ToCancelActivity = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: ToCancelActivity`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: ToCancelActivity`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        await sleep(1000);
        return ctx;
    },
});