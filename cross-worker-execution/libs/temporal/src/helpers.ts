import * as wf from '@temporalio/workflow';
import { type Workflow as TemporalWorkflow } from '@temporalio/workflow';
import { type WorkflowImplementation } from './definitions';

export * from './utils/workflow';

/**
 * Creates a generic workflow handler from a record of workflow implementations.
 */
export const createWorkflowsHandler = (handlers: Record<string, TemporalWorkflow>): wf.Workflow =>
    async function runWorkflow(this: any, ...args: unknown[]): wf.WorkflowReturnType {
        const workflowType = wf.workflowInfo().workflowType;
        const workflowFn = handlers[workflowType];
        if (!workflowFn) {
            const details =
                workflowFn === undefined
                    ? 'no such workflow handler is defined'
                    : `expected a function, but got: '${typeof workflowFn}'`;
            throw new TypeError(`Failed to initialize workflow of type '${workflowType}': ${details}`);
        }

        return workflowFn.apply(this, args);
    };

/**
 * Creates a generic workflow handler from a list of workflow implementations.
 */
export const createWorkflowHandlerFromImplementations = (
    workflows: Array<WorkflowImplementation<any, any>>
): wf.Workflow => {
    const handlers = workflows.reduce((agg, workflow) => {
        const workflowName = workflow.workflowDefinition.workflowName;
        if (agg[workflowName]) {
            throw new Error(`Workflow ${workflowName} is already defined`);
        }

        agg[workflowName] = workflow;
        return agg;
    }, {} as Record<string, TemporalWorkflow>);

    return createWorkflowsHandler(handlers);
};
