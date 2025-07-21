/* istanbul ignore file */
import {
    type ActivityInput,
    type ContinueAsNewInput,
    type GetLogAttributesInput,
    type LocalActivityInput,
    type Next,
    type StartChildWorkflowExecutionInput,
    type WorkflowOutboundCallsInterceptor,
} from '@temporalio/workflow';
import type { AgnosticContextManager } from '../../agnostic-context-manager';
import type { HeaderInjector } from '../../header-injector';

/**
 * Intercepts outbound calls from a workflow.
 * - Schedule Activity, Schedule Local Activity, Start Child Workflow Execution, Continue As New, Signal Workflow:
 *   Merge the current context with the message headers
 * - Get Log Attributes: Add the current context to the log attributes
 *
 * This represents the main mechanism to propagate the context from the workflow to other activities and workflows, by
 * setting the headers based on the currently available context.
 */
export class ContextWorkflowOutboundInterceptor<Context extends Record<string, any>>
    implements WorkflowOutboundCallsInterceptor
{
    constructor(
        private readonly contextInjector: HeaderInjector<Context>,
        private readonly contextManager: AgnosticContextManager<Context>
    ) {}

    async scheduleActivity(
        input: ActivityInput,
        next: Next<WorkflowOutboundCallsInterceptor, 'scheduleActivity'>
    ): Promise<unknown> {
        return next({
            ...input,
            headers: this.contextInjector.mergeDataWithHeaders(input.headers, this.contextManager.getContext()),
        });
    }

    async scheduleLocalActivity(
        input: LocalActivityInput,
        next: Next<WorkflowOutboundCallsInterceptor, 'scheduleLocalActivity'>
    ): Promise<unknown> {
        return next({
            ...input,
            headers: this.contextInjector.mergeDataWithHeaders(input.headers, this.contextManager.getContext()),
        });
    }

    async startChildWorkflowExecution(
        input: StartChildWorkflowExecutionInput,
        next: Next<WorkflowOutboundCallsInterceptor, 'startChildWorkflowExecution'>
    ): Promise<[Promise<string>, Promise<unknown>]> {
        return next({
            ...input,
            headers: this.contextInjector.mergeDataWithHeaders(input.headers, this.contextManager.getContext()),
        });
    }

    async continueAsNew(
        input: ContinueAsNewInput,
        next: Next<WorkflowOutboundCallsInterceptor, 'continueAsNew'>
    ): Promise<never> {
        return next({
            ...input,
            headers: this.contextInjector.mergeDataWithHeaders(input.headers, this.contextManager.getContext()),
        });
    }

    getLogAttributes(
        input: GetLogAttributesInput,
        next: Next<WorkflowOutboundCallsInterceptor, 'getLogAttributes'>
    ): Record<string, unknown> {
        return next({
            input,
            context: {
                [this.contextInjector.headerName]: this.contextManager.getContext(),
            },
        });
    }
}
