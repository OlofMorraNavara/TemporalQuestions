import {
  ApplicationFailure,
  executeChild, getExternalWorkflowHandle,
  ParentClosePolicy,
  startChild, workflowInfo,
} from "@temporalio/workflow";
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowOutput,
} from "../types/context";
import { GlobalSignalCatcher, LocalSignalCatcher } from "./index";
import * as signals from "../signals";

export async function OrchestratorWorkflow(
  input: WorkflowInput,
): Promise<WorkflowOutput> {
  let ctx: WorkflowContext = {
    _generated: {} as Record<string, any>,
    ...input,
  };

  ctx._generated.mainWorkflowId = "LocalSignalCatcher";

  // TODO start global listeners and main flow
  const mainPromise = executeChild(LocalSignalCatcher, {
    args: [ctx],
    workflowId: ctx._generated.mainWorkflowId,
    parentClosePolicy: ParentClosePolicy.REQUEST_CANCEL,
  });

  // TODO Global catcher handle.
  const globalCatcherWorkflowHandle = await startChild(GlobalSignalCatcher, {
    args: [ctx],
    workflowId: "GlobalSignalCatcher",
    parentClosePolicy: ParentClosePolicy.ABANDON,
  });

  await mainPromise;

  try {
    const handle = getExternalWorkflowHandle('')
    await globalCatcherWorkflowHandle.signal(signals.localSignalCatcherDone);
  } catch (err: ApplicationFailure) {
    if (err.type != "ExternalWorkflowExecutionNotFound") {
      throw err;
    }
  }

  return ctx;
}
