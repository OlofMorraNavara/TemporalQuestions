import { type WorkflowInterceptors } from '@temporalio/workflow';
import { createWorkflowContextInterceptors } from './create-workflow-context-interceptors';

/**
 * Interceptor for context.
 * This is used to inject context into the workflow and propagate it to activities/child workflows.
 */
export const interceptors = (): WorkflowInterceptors => createWorkflowContextInterceptors();
