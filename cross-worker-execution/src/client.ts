import { Client } from '@temporalio/client';
import { workflowA } from './workflow-A/workflow';

async function run() {
    const client = new Client();

    const result = await client.workflow.execute(workflowA, {
        taskQueue: 'process-group-1',
        workflowId: 'workflowA',
        args: [{ name: 'inputName' }],
    });

    console.log('Result: ', result);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
