import { log, sleep } from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";

export const TaskUserSignal = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: TaskUserSignal`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: TaskUserSignal`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    // TODO send start form with data.
    return ctx;
  },
});
