import { Client } from '@temporalio/client';
import { loopingWorkflow } from './workflows';

async function run() {
  const client = new Client();

  const result = await client.workflow.execute(loopingWorkflow, {
    taskQueue: 'continue-as-new',
    workflowId: 'loop-0',
    args: [
      {name: ''}
    ]
  });

  console.log('Result: ', result);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
