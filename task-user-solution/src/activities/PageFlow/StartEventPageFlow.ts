import { log } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";

export const StartEventPageFlow = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: startEvent`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: startEvent`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    return ctx;
  },
});
