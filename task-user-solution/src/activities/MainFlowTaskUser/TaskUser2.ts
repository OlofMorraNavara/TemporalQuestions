import { log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";

export const TaskUser2 = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: TaskUser2`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: TaskUser2`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    return ctx;
  },
});
