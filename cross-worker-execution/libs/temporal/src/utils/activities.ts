import { type Info } from '@temporalio/activity';
import { ApplicationFailure, type Duration } from '@temporalio/common';
import { type Activity, type ActivityDefinition } from '../definitions';

const manualActivityRetryType = 'ManualActivityRetry';

export const isManualActivityRetry = (error: unknown): error is ApplicationFailure => {
    // duck type checking, needed when bundling because you cannot rely on instanceof
    if (typeof error === 'object' && error !== null && 'type' in error) {
        return error.type === manualActivityRetryType;
    }

    return false;
};

export const retry = (reason?: string, nextRetryDelay?: Duration) => {
    // we throw to retrigger the retry, this can be also done with throwing ApplicationFailure
    const error = ApplicationFailure.create({
        // this type is can be used in logs and alerts to filter out manual retries
        type: manualActivityRetryType,
        message: reason,
        nonRetryable: false,
        nextRetryDelay,
    });
    throw error;
};

export const noResult = () =>
    // we throw to retrigger the retry, this can be also done with throwing ApplicationFailure
    retry('no-result');

/**
 * Create an activity implementation from an activity definition.
 */
export const createActivity = <TInput, TOutput>(
    _definition: ActivityDefinition<string, TInput, TOutput>,
    execution: Activity<NoInfer<TInput>, NoInfer<TOutput>>
): Activity<TInput, TOutput> => execution;

/**
 * Get an idempotency key that is unique for the `activityInfo`.
 * See https://temporal.io/blog/idempotency-and-durable-execution#idempotency-keys for more information.
 */
export const getActivityIdempotencyKey = (activityInfo: Info) =>
    `${activityInfo.workflowExecution.runId}_${activityInfo.activityId}`;
