import { heartbeat, log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";
import { CancelledFailure } from "@temporalio/workflow";

export const Timer = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: Timer`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: Timer`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    try {
      await Promise.race([
        // Heartbeats
        (async () => {
          while (true) {
            await sleep(10);
            heartbeat();
          }
        })(),
        // Run logic
        (async () => {
          await sleep(ctx._generated.__TimerDuration);
        })(),
      ]);
    } catch (err) {
      if (err instanceof CancelledFailure) {
        console.warn("Timer cancelled", { message: err.message });
      }
      throw err;
    }
    ctx._generated.Timer1Timeout = true;
    return ctx;
  },
});
