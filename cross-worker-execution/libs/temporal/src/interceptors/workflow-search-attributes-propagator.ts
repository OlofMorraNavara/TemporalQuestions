import {
    type Next,
    type StartChildWorkflowExecutionInput,
    workflowInfo,
    type WorkflowInterceptors,
    type WorkflowOutboundCallsInterceptor,
} from '@temporalio/workflow';

/* istanbul ignore file */
class SearchAttributesPropagater implements WorkflowOutboundCallsInterceptor {
    async startChildWorkflowExecution(
        input: StartChildWorkflowExecutionInput,
        next: Next<WorkflowOutboundCallsInterceptor, 'startChildWorkflowExecution'>
    ): Promise<[Promise<string>, Promise<unknown>]> {
        return next({
            ...input,
            options: {
                ...input.options,
                // propagate all searchAttributes to the child workflows options
                searchAttributes: {
                    ...input.options.searchAttributes,
                    ...workflowInfo().searchAttributes,
                },
            },
        });
    }
}

/**
 * Interceptor for propagating search attributes to the child workflows.
 */
export const interceptors = (): WorkflowInterceptors => ({
    inbound: [],
    outbound: [new SearchAttributesPropagater()],
});
