import { log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";

export const StartPageFlow = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: StartPageFlow`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: StartPageFlow`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    return ctx;
  },
});
