import { AsyncLocalStorage } from '@temporalio/workflow';
import { AgnosticContextManager } from './agnostic-context-manager';
import type { Context } from './context.interface';

/**
 * Context manager for use in workflow code, using the injected-by-Temporal AsyncLocalStorage from
 * `@temporalio/workflow` as backing.
 */
export const workflowContextManager = new AgnosticContextManager(new AsyncLocalStorage<Context>());
