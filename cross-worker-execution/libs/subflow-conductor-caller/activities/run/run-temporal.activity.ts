import { Client, Connection } from '@temporalio/client';
import { LocationTemporal, WorkflowContext } from '../../context';

export async function runTemporal(input: { location: LocationTemporal; input: any }): Promise<string> {
    const connection = await Connection.connect();
    const client = new Client({ connection });

    const x = await client.workflow.start(input.location.name, {
        workflowId: input.location.workflowId,
        taskQueue: input.location.taskQueue,
        args: [input],
    });

    return x.workflowId;
}
