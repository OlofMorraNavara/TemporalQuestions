import { log, sleep } from '@temporalio/activity';
import { createActivity } from '../create';
import { WorkflowContext } from '../../types/context';

export const TestActivity = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: TestActivity`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: TestActivity`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        await sleep(5000) // Simulate some processing time
        ctx._generated.testActivity = true;
        return ctx;
    },
});
