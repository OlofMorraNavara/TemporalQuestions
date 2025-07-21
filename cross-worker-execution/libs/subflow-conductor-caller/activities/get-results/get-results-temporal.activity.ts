import { Client, Connection } from '@temporalio/client';

export async function getResultsTemporal(input: { workflowId: string }): Promise<any> {
    const connection = await Connection.connect();
    const client = new Client({ connection });

    const handle = client.workflow.getHandle(input.workflowId);
    return await handle.result();
}
