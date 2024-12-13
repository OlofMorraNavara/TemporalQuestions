import { Client } from '@temporalio/client';
import { workflow, workflowA } from './workflows';

async function run() {
  const client = new Client();

  const result = await client.workflow.execute(workflow, {
    taskQueue: 'continue-as-new',
    workflowId: 'loop-0',
    args: [
      // {name: '1'} // End in node F
      {name: '2'} // End in node G
    ]
  });

  console.log('Result: ', result);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
