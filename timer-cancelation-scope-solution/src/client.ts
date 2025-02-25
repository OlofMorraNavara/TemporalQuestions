import { Connection, Client } from '@temporalio/client';
import { TimerProcessCancellationScopes } from './workflows';
import { nanoid } from 'nanoid';
import { WorkflowInput, WorkflowOutput } from './types/context';
import { TibcoDate, TibcoDateTime, TibcoDateTimetz, TibcoDuration, TibcoTime, TibcoList } from './types/tibco/types';

async function run(input: WorkflowInput): Promise<WorkflowOutput> {
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

    const handle = await client.workflow.start(TimerProcessCancellationScopes, {
        taskQueue: 'local-queue',
        args: [input],
        // in practice, use a meaningful business ID, like customerId or transactionId
        workflowId: 'workflow-' + nanoid(),
    });
    console.log(`Started workflow ${handle.workflowId}`);

    return await handle.result();
}

const input: WorkflowInput = {};

run(input).catch((err) => {
    console.error(err);
    process.exit(1);
});
