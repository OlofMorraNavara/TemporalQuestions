// @@@SNIPSTART typescript-continue-as-new-workflow
import { continueAsNew, sleep, log, proxyActivities } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const { A, B, C } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

function c1(ctx: WorkflowContext) {
  return ctx.name === 'AB';
}

export async function loopingWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  ctx = await A(ctx);
  await sleep(1000);

  ctx = await B(ctx);
  await sleep(1000);

  if (c1(ctx)) {
    await continueAsNew<typeof loopingWorkflow>(ctx);
  } else {
    ctx = await C(ctx);
  }

  return ctx;
}
// @@@SNIPEND
