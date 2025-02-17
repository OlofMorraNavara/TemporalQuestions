import {
  executeChild, log, proxyActivities,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const { A, B, C, ThrowFailureActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 1,
  }
});


export async function parallelWorkflowWithPromiseAll(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  await Promise.all([
      executeChild(instantFinishedWorkflow, {
        args: [ctx],
        retry: {
            maximumAttempts: 1,
        }
      }),
    executeChild(finishAfter3SecondsWorkflow, {
      args: [ctx],
      parentClosePolicy: 'ABANDON',
    }),
    executeChild(finishAfter3SecondsWorkflow, {
      args: [ctx],
      parentClosePolicy: 'TERMINATE',
    }),
    executeChild(finishAfter3SecondsWorkflow, {
      args: [ctx],
      parentClosePolicy: 'REQUEST_CANCEL',
    }),
    executeChild(throwErrorAfter1SecondWorkflow, {
      args: [ctx],
    }),
  ]).catch((error) => {
    log.error('Child workflow failed', { error });
    // Throw error to fail the workflow if any child workflow failed
    throw error;
  });

  return ctx;
}

export async function parallelWorkflowWithPromiseAllSettled(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  await Promise.allSettled([
    executeChild(instantFinishedWorkflow, {
      args: [ctx],
    }),
    executeChild(finishAfter3SecondsWorkflow, {
      args: [ctx],
    }),
    executeChild(throwErrorAfter1SecondWorkflow, {
      args: [ctx],
    }),
  ]).then(async (results) => {
    log.info('Promise.allSettled results', { results });
    for (const result of results) {
      if (result.status === 'rejected') {
        log.error('Child workflow failed', { error: result.reason });
        // Throw error to fail the workflow if any child workflow failed
        await ThrowFailureActivity(result.reason);

        // This did set a WorkflowTaskFailed event in the history, but the workflow did not fail (it keeps running...)
        // throw new Error('Child workflow failed');
      }
    }
  })

  return  ctx;
}

/**
 * Instantly finished
 * @param input
 */
export async function instantFinishedWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

    ctx = await A(ctx);

  return ctx;
}

/**
 * Sleep 3 seconds and finish
 * @param input
 */
export async function finishAfter3SecondsWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  ctx = await B(ctx);

  return ctx;
}

/**
 * Sleep 1 second and throw error
 * @param input
 */
export async function throwErrorAfter1SecondWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  ctx = await C(ctx);

  return ctx;
}