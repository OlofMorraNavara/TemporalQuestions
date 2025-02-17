import { WorkflowError } from '@temporalio/workflow';

/**
 * Activity to throw a failure to fail the workflow on purpose as it is not possible to use promise.settleAll and fail
 * within a workflow itself.
 *
 * @param reason
 * @constructor
 */
export async function ThrowFailureActivity(reason: string): Promise<void> {
    throw new WorkflowError(`Throwing failure to fail workflow on purpose with reason: ${reason}`);
}