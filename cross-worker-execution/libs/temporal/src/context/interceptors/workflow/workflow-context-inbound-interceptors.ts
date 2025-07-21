/* istanbul ignore file */
import {
    type Next,
    type QueryInput,
    type SignalInput,
    type UpdateInput,
    type WorkflowExecuteInput,
    type WorkflowInboundCallsInterceptor,
} from '@temporalio/workflow';
import type { AgnosticContextManager } from '../../agnostic-context-manager';
import type { HeaderInjector } from '../../header-injector';

/**
 * Intercepts inbound calls to a workflow.
 * - Execute: Retrieve context from message headers and set up async local storage to make it available for the workflow
 * - Validate Update: Retrieve context from message headers and merge it with the existing context, before setting up
 *   async local storage to make it available for the workflow
 * - Handle Signal: Retrieve context from message headers and merge it with the existing context, before setting up
 *   async local storage to make it available for the workflow
 *
 * This represents the main mechanism to retain the context and making it available for workflows, by setting up an
 * async local storage containing the current context parsed from Temporal message headers. This can then be used by the
 * outbound interceptors and workflow code.
 */
export class ContextWorkflowInboundInterceptor<Context extends Record<string, any>>
    implements WorkflowInboundCallsInterceptor
{
    private executionContext: Context | undefined;

    constructor(
        private readonly contextInjector: HeaderInjector<Context>,
        private readonly contextManager: AgnosticContextManager<Context>
    ) {}

    async execute(
        input: WorkflowExecuteInput,
        next: Next<WorkflowInboundCallsInterceptor, 'execute'>
    ): Promise<unknown> {
        this.executionContext = this.contextInjector.getDataFromHeaders(input.headers);

        return this.contextManager.withContext(() => next(input), this.executionContext);
    }

    validateUpdate(input: UpdateInput, next: Next<WorkflowInboundCallsInterceptor, 'validateUpdate'>) {
        if (!this.executionContext) {
            return next(input);
        }

        this.contextManager.withContext(() => next(input), this.executionContext);
    }

    handleSignal(input: SignalInput, next: Next<WorkflowInboundCallsInterceptor, 'handleSignal'>) {
        if (!this.executionContext) {
            return next(input);
        }

        return this.contextManager.withContext(() => next(input), this.executionContext);
    }

    handleQuery(input: QueryInput, next: Next<WorkflowInboundCallsInterceptor, 'handleQuery'>) {
        if (!this.executionContext) {
            return next(input);
        }

        return this.contextManager.withContext(() => next(input), this.executionContext);
    }

    handleUpdate(input: UpdateInput, next: Next<WorkflowInboundCallsInterceptor, 'handleUpdate'>) {
        if (!this.executionContext) {
            return next(input);
        }

        return this.contextManager.withContext(() => next(input), this.executionContext);
    }
}
