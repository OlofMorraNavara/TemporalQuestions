import { WorkflowContext } from '../types/context';
import * as DatabaseHelpers from '../utils/database-helpers/index';

export async function cancelTaskUserSignalCancelAuditEvent(ctx: WorkflowContext) {
    console.log('Hit cancelTaskUserSignal');
    ctx._generated.hitCancelTaskUserSignalAuditEvent = true;
    // TODO : DB call?

    return ctx;
}
