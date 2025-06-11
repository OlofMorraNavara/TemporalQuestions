import { log, sleep } from '@temporalio/activity';
import { createActivity } from '../create';
import { WorkflowContext } from '../../types/context';

export const UpdateTimerSignal = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: UpdateTimerSignal`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: UpdateTimerSignal`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        return ctx;
    },
});
