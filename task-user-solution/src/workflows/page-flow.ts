import {
  condition,
  proxyActivities,
  setHandler,
  sleep,
  workflowInfo,
} from "@temporalio/workflow";
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowOutput,
} from "../types/context";
import type * as activities from "../activities";
import * as signals from "../signals";

const { StartEventPageFlow, TaskUserPageFlow, EndEventPageFlow } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minute",
    retry: {
      maximumAttempts: 3,
    },
  });

export async function PageFlow(
  input: WorkflowInput,
): Promise<WorkflowOutput> {
  let ctx: WorkflowContext = {
    _generated: {} as Record<string, any>,
    ...input,
  };

  ctx = await StartEventPageFlow(ctx);

  ctx = await TaskUserPageFlow(ctx);

  // Signal catcher with form data.
  let formDataReceivedTaskUserPageFlow = false;
  setHandler(
    signals.formDataTaskUserPageFlow,
    (inputTaskUserPageFlow: Record<string, any>) => {
      formDataReceivedTaskUserPageFlow = true;
      ctx._generated.formDataTaskUserPageFlow = inputTaskUserPageFlow;
    },
  );

  await condition(() => formDataReceivedTaskUserPageFlow);

  ctx._generated.pageworkflow = true;

  ctx = await EndEventPageFlow(ctx);

  return ctx;
}
