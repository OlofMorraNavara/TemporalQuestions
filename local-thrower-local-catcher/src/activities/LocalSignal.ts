import { log } from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';
import { getExternalWorkflowHandle } from '@temporalio/workflow';
import * as signals from '../signals';

export const LocalSignal = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: LocalSignal`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: LocalSignal`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        return ctx;
    },
});
