import {log, sleep} from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

export const NormalActivity = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: NormalActivity`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: NormalActivity`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        ctx._generated.NormalActivity = true;
        await sleep(10000)
        return ctx;
    },
});
