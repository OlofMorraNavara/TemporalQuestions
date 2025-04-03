import {
  condition,
  defineSignal,
  getExternalWorkflowHandle,
  proxyActivities,
  setHandler,
  workflowInfo,
} from "@temporalio/workflow";
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowOutput,
} from "../types/context";
import * as signals from "../signals";
import { GlobalSignalInput } from "../signals/signal-data/GlobalSignalInput";
import type * as activities from "../activities";

const { RegisterGlobalSignalCatcher, TerminateGlobalSignalCatcher, EndEvent3 } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 3,
  },
});

//TODO: 'Local' thrower:
export async function throwLocalSignal() {
  const handle = getExternalWorkflowHandle(workflowInfo().parent.workflowId);
  await handle.signal(defineSignal("localSignalCatcher"));
}

export async function GlobalSignalCatcher(
  input: WorkflowInput,
): Promise<WorkflowOutput> {
  let ctx: WorkflowContext = {
    _generated: {} as Record<string, any>,
    ...input,
  };

  // TODO: Register global signal catcher in orchestrator.
  await RegisterGlobalSignalCatcher(ctx);

  // TODO: Global signal handler
  let globalSignalReceived = false;
  setHandler(signals.globalSignal, () => {
    globalSignalReceived = true;
  });

  // TODO: Main flow done received handler.
  let localSignalCatcherDoneReceived = false;
  setHandler(defineSignal("localSignalCatcherDone"), () => {
    localSignalCatcherDoneReceived = true;
  });

  // TODO: Temporal polling mechanism.
  await condition(() => globalSignalReceived || localSignalCatcherDoneReceived);

  // TODO: Terminate the global signal catcher in the orchestrator.
  ctx = await TerminateGlobalSignalCatcher(ctx);

  if (localSignalCatcherDoneReceived) {
    return ctx;
  }

  // TODO throw local.
  await throwLocalSignal();

  ctx = await EndEvent3(ctx);

  return ctx;
}
