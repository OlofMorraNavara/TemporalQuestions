// @@@SNIPSTART typescript-continue-as-new-workflow
import { continueAsNew, sleep, log, proxyActivities, executeChild } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from './types/context';
import type * as activities from './activities';

const { A, B, D, E, F, G } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

function c1(ctx: WorkflowContext) {
  return ctx.name === '1AB' || ctx.name === '2AB' || ctx.name === '1ABDABEB';
}

function c2(ctx: WorkflowContext) {
  return ctx.name === '1ABDABEBD';
}

function c3(ctx: WorkflowContext) {
  return ctx.name === '2ABDABEBE';
}

export async function workflow(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  return await gotoA(ctx);
}

async function gotoA(input: WorkflowInput): Promise<WorkflowOutput> {
  log.info('Running Workflow with input', { input });
  let ctx: WorkflowContext = {
    ...input
  }

  ctx = await A(ctx);
  return await gotoB(ctx);
}

async function gotoB(input: WorkflowContext): Promise<WorkflowContext> {
  let ctx: WorkflowContext = {
    ...input
  }

  ctx = await B(ctx);

  if (c1(ctx)) {
    ctx = await D(ctx);

    if (c2(ctx)) {
      ctx = await F(ctx);
    } else {
      return await gotoA(ctx);
    }
  } else {
    ctx = await E(ctx);

    if (c3(ctx)) {
      ctx = await G(ctx);
    } else {
      return await gotoB(ctx);
    }
  }

  return ctx;
}

// @@@SNIPEND
