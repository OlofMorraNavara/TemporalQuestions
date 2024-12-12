// @@@SNIPSTART typescript-continue-as-new-workflow
import { continueAsNew, sleep, log, proxyActivities, executeChild } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const { A, B, C, D, E } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

function c1(ctx: WorkflowContext) {
  return ctx.name === 'ABC';
}

function c2(ctx: WorkflowContext) {
  return ctx.name === 'ABCBCD';
}

export async function loopingWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  ctx = await A(ctx);
  ctx = await executeChild(childWorkflow, { workflowId: 'childLoop', args: [ctx] });
  ctx = await D(ctx);

  if (c2(ctx)) {
    await continueAsNew<typeof loopingWorkflow>(ctx);
  } else {
    ctx = await E(ctx);
  }

  return ctx;
}

export async function childWorkflow(input: WorkflowContext): Promise<WorkflowContext> {
  log.info('Running Childworkflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  ctx = await B(ctx);
  await sleep(1000);

  ctx = await C(ctx);
  await sleep(1000);

  if (c1(ctx)) {
    await continueAsNew<typeof childWorkflow>(ctx);
  }

  return ctx;
}
// @@@SNIPEND
