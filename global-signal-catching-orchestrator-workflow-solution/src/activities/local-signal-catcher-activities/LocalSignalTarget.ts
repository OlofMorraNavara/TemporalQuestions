import { log, sleep } from "@temporalio/activity";
import { createActivity, createActivityWithHeartbeats } from "../create";
import { WorkflowContext } from "../../types/context";

export const LocalSignalTarget = createActivityWithHeartbeats({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: LocalSignalTarget`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: LocalSignalTarget`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    await sleep(30000);
    return ctx;
  },
});
