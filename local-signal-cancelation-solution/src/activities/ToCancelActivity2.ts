import {cancelled, heartbeat, log, sleep} from '@temporalio/activity';
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
        for (let i = 0; i < 3; i++) {
            await sleep(1000);
            console.log('Heartbeat send from ToCancelActivity2');
            heartbeat();
            await cancelled().catch(() => {console.log('Catch cancellation in ToCancelActivity2')})
        }

        return ctx;
    },
});