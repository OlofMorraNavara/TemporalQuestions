import { z } from 'zod';
import { defineActivity, defineWorkflow } from '../definitions';
import { createWorkflowHandlerFromImplementations } from '../helpers';
import {
    createContextExecution,
    createWorkflow,
    executeActivity,
    invariantException,
    unreachableCodeException,
} from './workflow';

export const validationWorkflowDef = defineWorkflow({
    workflowName: 'testZodWorkflow',
});

const zodSchema = z.object({
    foo: z.string(),
});

const testActivity = defineActivity('testActivity')<void, string>({
    scheduleToStartTimeout: '2s',
    startToCloseTimeout: '10s',
    retry: {
        maximumAttempts: 1,
    },
});

const validationWorkflow = createWorkflow(validationWorkflowDef, async (input) => {
    zodSchema.parse(input);
    const nextStep = await executeActivity(testActivity, undefined);

    if (nextStep === 'unreachable') {
        throw unreachableCodeException({} as never, 'test');
    }

    if (nextStep === 'invariant') {
        throw invariantException('invariant');
    }
});

export const workflowExecutionDef = defineWorkflow<{
    activities: Array<'testActivity'>;
}>({
    workflowName: 'workflowExecution',
});

const workflowExecution = createWorkflow(
    workflowExecutionDef,
    createContextExecution({
        context(input) {
            return {
                activities: [...input.activities, ...input.activities],
            };
        },
        execution: async function execution(_input, context) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const _ of context.activities) {
                await executeActivity(testActivity, undefined);
            }
        },
    })
);

export default createWorkflowHandlerFromImplementations([validationWorkflow, workflowExecution]);
