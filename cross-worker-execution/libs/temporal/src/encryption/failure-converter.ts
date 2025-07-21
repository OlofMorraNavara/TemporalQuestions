import { DefaultFailureConverter } from '@temporalio/common';

/**
 * Used by the workflow bundle and the data converter to encode/decode errors.
 * It is is important to include this in bundleWorkflowCode options and in the worker's options
 * to have encoding/decoding of failures on workflow and activity level.
 */
export const failureConverter = new DefaultFailureConverter({
    // ensures we encode errors
    encodeCommonAttributes: true,
});
