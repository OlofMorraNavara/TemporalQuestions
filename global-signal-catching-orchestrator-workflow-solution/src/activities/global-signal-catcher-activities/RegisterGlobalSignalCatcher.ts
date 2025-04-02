import {Context, log} from "@temporalio/activity";
import { createActivity } from "../create";
import { WorkflowContext } from "../../types/context";
import axios from "axios";
import * as signals from "../../signals";

export const RegisterGlobalSignalCatcher = createActivity({
    initiated: async (ctx: WorkflowContext) => {
        log.info(`Running initial script for: RegisterGlobalSignalCatcher`);
        return ctx;
    },
    completed: async (ctx: WorkflowContext) => {
        log.info(`Running completed script for: RegisterGlobalSignalCatcher`);
        return ctx;
    },
    run: async (ctx: WorkflowContext) => {
        try {
            await axios.post(
                'http://localhost:9090/v1/register',
                {
                    workflow_id: Context.current().info.workflowExecution.workflowId,
                    signal_name: signals.globalSignal.name,
                    namespace: 'default',
                    signal_data: {
                        CaseID: '1234', // ctx.CaseID,
                        Header: '4566778', // ctx.Header,
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }
        catch (err) {
            console.log('Error registering global listener', err);
        }
        return ctx;
    },
});
