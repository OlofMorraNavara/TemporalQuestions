import { sleep, workflowInfo } from "@temporalio/workflow";
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowOutput,
} from "../types/context";
import * as signals from "../signals";
import axios from "axios";

// TODO: Global thrower.
async function throwGlobalSignal(ctx: WorkflowContext) {
  try {
    await axios.post(
      "http://localhost:9090/v1/throw",
      {
        workflow_id: workflowInfo().workflowId,
        signal_name: signals.globalSignal.name,
        namespace: "default",
        signal_data: {
          "CaseID": "1234", // ctx.CaseID,
          "Header": "4566778", // ctx.Header,
        },
        signal_kind: "transitory",
        expires_at: new Date(Date.now() + (2 * 24 * 60 * 60 * 1000))
          .toISOString(), // Expires in 2 days
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.log("Error throwing global signal", err);
  }
}

export async function GlobalSignalThrower(
  input: WorkflowInput,
): Promise<WorkflowOutput> {
  let ctx: WorkflowContext = {
    _generated: {} as Record<string, any>,
    ...input,
  };

  await sleep(3000);

  // TODO throw global.
  await throwGlobalSignal(ctx);

  return ctx;
}
