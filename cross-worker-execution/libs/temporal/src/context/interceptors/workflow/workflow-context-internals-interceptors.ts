/* istanbul ignore file */
import { type DisposeInput, type Next, type WorkflowInternalsInterceptor } from '@temporalio/workflow';
import type { AgnosticContextManager } from '../../agnostic-context-manager';

/**
 * Intercepts internal workflow calls.
 * - Dispose: Disable the context manager
 */
export class ContextWorkflowInternalsInterceptor<Context extends Record<string, any>>
    implements WorkflowInternalsInterceptor
{
    constructor(private readonly contextManager: AgnosticContextManager<Context>) {}

    dispose(input: DisposeInput, next: Next<WorkflowInternalsInterceptor, 'dispose'>): void {
        this.contextManager.disable();
        next(input);
    }
}
