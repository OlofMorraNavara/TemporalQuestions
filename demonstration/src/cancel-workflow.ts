import { Client } from '@temporalio/client';

async function cancel(workflowId: string): Promise<void> {
    const client = new Client();

    const handle = client.workflow.getHandle(workflowId);

    await handle.cancel();
    console.log('workflow canceled', 'workflowId:', workflowId);
}

// get the workflowId from the command line
let workflowId = 'unknown-workflow-id';
const workflowIdIndex = process.argv.indexOf('--workflowId');
if (workflowIdIndex !== -1) {
    workflowId = process.argv[workflowIdIndex + 1];
}

cancel(workflowId)
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
