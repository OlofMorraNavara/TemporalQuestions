import { log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";

export const GlobalSignalActivity = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: GlobalSignalActivity`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: GlobalSignalActivity`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    return ctx;
  },
});
