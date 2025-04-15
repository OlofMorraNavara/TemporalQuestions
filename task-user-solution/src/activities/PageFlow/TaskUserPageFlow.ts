import { log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";

export const TaskUserPageFlow = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: TaskUser`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: TaskUser`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    // TODO send start form with data.
    return ctx;
  },
});
