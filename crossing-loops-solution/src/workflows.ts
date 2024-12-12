// @@@SNIPSTART typescript-continue-as-new-workflow
import { continueAsNew, sleep, log, proxyActivities, executeChild } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const { A, B, C, D, E, F, G } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

function c1(ctx: WorkflowContext) {
  return ctx.name === 'ABC';
}

function c2(ctx: WorkflowContext) {
  return ctx.name === 'ABC';
}

function c3(ctx: WorkflowContext) {
  return ctx.name === 'ABCDABCEBCE';
}

export async function loopingWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  ctx = await A(ctx);

  await executeChild(childWorkflow, { args: [ctx]});

  return ctx;
}

export async function childWorkflow(input: WorkflowContext): Promise<WorkflowContext> {
  let ctx = {
    ...input
  }

  ctx = await B(ctx);
  ctx = await C(ctx);

  if (c1(ctx)) {
    ctx = await D(ctx);
    if (c2(ctx)) {
      ctx = await G(ctx);
    } else {
      // This becomes problematic I think?
      ctx = await executeChild(loopingWorkflow, { args: [ctx]});
    }
  } else {
    ctx = await E(ctx);
    if (c3(ctx)) {
      ctx = await F(ctx);
    } else {
      await continueAsNew<typeof childWorkflow>(ctx);
    }
  }

  return ctx;
}

// @@@SNIPEND
