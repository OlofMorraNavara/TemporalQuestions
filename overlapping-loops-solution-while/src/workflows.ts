// @@@SNIPSTART typescript-continue-as-new-workflow
import { log, proxyActivities, executeChild } from '@temporalio/workflow';
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

  do {
    ctx = await A(ctx);

    do {
      ctx = await B(ctx);
      ctx = await C(ctx);
    } while (c1(ctx));

    ctx = await D(ctx);
  } while (c2(ctx))

  ctx = await E(ctx);

  return ctx;
}
// @@@SNIPEND
