import {
  condition,
  getExternalWorkflowHandle,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowOutput,
} from "../types/context";
import * as signals from "../signals";
import type * as activities from "../activities";

const { RegisterGlobalSignalCatcher, GlobalSignalActivity, EndEvent3 } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minute",
    retry: {
      maximumAttempts: 3,
    },
  });

//TODO: 'Local' thrower:
export async function throwLocalSignal(ctx: WorkflowContext) {
  const handle = getExternalWorkflowHandle(ctx._generated.mainWorkflowId);
  await handle.signal(signals.localSignal);
}

export async function GlobalSignalCatcher(
  input: WorkflowInput,
): Promise<WorkflowOutput> {
  let ctx: WorkflowContext = {
    _generated: {} as Record<string, any>,
    ...input,
  };

  await RegisterGlobalSignalCatcher(ctx);

  // TODO: Global signal handler
  let localSignalCatcherDoneReceived = false;
  let globalSignalReceived = false;

  setHandler(signals.globalSignal, () => {
    globalSignalReceived = true;
  });
  setHandler(signals.localSignalCatcherDone, () => {
    localSignalCatcherDoneReceived = true;
  });
  // TODO: Temporal polling mechanism.
  await condition(() => globalSignalReceived || localSignalCatcherDoneReceived);

  if (localSignalCatcherDoneReceived) {
    return ctx;
  }

  // TODO throw local.
  await throwLocalSignal(ctx);

  await GlobalSignalActivity(ctx);
  await EndEvent3(ctx);

  return ctx;
}
