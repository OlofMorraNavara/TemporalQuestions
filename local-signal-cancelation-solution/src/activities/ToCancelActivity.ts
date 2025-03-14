import {cancelled, heartbeat, log, sleep} from '@temporalio/activity';
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
        for (let i = 0; i < 5; i++) {
            await sleep(1000);
            console.log('Heartbeat send from ToCancelActivity');
            heartbeat();
            await cancelled().catch(() => {console.log('Catch cancellation in ToCancelActivity')})
        }

        return ctx;
    },
});