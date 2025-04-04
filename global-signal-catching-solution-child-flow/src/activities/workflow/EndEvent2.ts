import { log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";

export const EndEvent2 = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: EndEvent2`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: EndEvent2`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    await sleep(5000);
    return ctx;
  },
});
