import { log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";

export const EndEventPageFlow = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: EndEventPageFlow`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: EndEventPageFlow`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    await sleep(5000);
    return ctx;
  },
});
