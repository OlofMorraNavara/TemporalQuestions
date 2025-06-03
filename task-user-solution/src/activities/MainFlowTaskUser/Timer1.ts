import { heartbeat, log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";
import { CancelledFailure } from "@temporalio/workflow";

export const Timer1 = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: Timer1`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: Timer1`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    await sleep(ctx._generated.__TimerDuration1);
    return ctx;
  },
});
