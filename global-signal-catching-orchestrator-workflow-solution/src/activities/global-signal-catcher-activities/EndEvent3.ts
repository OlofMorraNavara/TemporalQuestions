import {Context, log, sleep} from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";
import axios from "axios";
import * as signals from "../../signals";

export const EndEvent3 = createActivity({
  initiated: async (ctx: WorkflowContext) => {
    log.info(`Running initial script for: EndEvent3`);
    return ctx;
  },
  completed: async (ctx: WorkflowContext) => {
    log.info(`Running completed script for: EndEvent3`);
    return ctx;
  },
  run: async (ctx: WorkflowContext) => {
    try {
      await axios.post(
          'http://localhost:9090/v1/terminated',
          {
            workflow_id: Context.current().info.workflowExecution.workflowId,
            namespace: 'default',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
      );
    }
    catch (err) {
      console.log('Error terminating global listener', err);
    }
    return ctx;
  },
});
