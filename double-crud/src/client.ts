import { Connection, Client } from '@temporalio/client';
import { nanoid } from 'nanoid';
import { WorkflowInput } from './types/context';
import { CRUDProcess } from './workflows';

async function run(input: WorkflowInput): Promise<void> {
    // Connect to the default Server location
    const connection = await Connection.connect({ address: 'localhost:7233' });
    // In production, pass options to configure TLS and other settings:
    // {
    //   address: 'foo.bar.tmprl.cloud',
    //   tls: {}
    // }

    const client = new Client({
        connection,
        namespace: 'default',
        dataConverter: { payloadConverterPath: require.resolve('./payload-converter') },
    });

    const handle = await client.workflow.start(CRUDProcess, {
        taskQueue: 'local-queue',
        args: [{
            operation: 'CREATE',
            entityType: 'eMobility',
            payload: {}
        }],
        // in practice, use a meaningful business ID, like customerId or transactionId
        workflowId: 'workflow-' + nanoid(),
    });
    console.log(`Started workflow ${handle.workflowId}`);
}

const input: WorkflowInput = {};

run(input).catch((err) => {
    console.error(err);
    process.exit(1);
});
