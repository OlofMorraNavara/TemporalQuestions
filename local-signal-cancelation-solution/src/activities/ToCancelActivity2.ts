import { log, sleep} from '@temporalio/activity';
import { createActivity } from './create';
import { WorkflowContext } from '../types/context';

export const ToCancelActivity2 = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: ToCancelActivity2`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: ToCancelActivity2`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        // Activity logic mock:
        for (let i = 0; i < 5; i++) {
            console.warn('Run logic', {i});
            await sleep(1000);
        }
        return ctx;
    },
    cancelled: async (ctx: WorkflowContext) => {
        log.info(`Running cancelled script for: ToCancelActivity2`);
        ctx._generated.cancelLogicToCancelActivity2 = true;
        return ctx;
    }
});