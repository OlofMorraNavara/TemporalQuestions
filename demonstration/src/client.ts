import { Client } from '@temporalio/client';
import { cleanCodeWorkflow } from './workflows';

async function run(workflowType: string) {
  const client = new Client();

  const result = await client.workflow.execute(workflowType, {
    taskQueue: 'demonstration',
    workflowId: `demonstration-${workflowType}`,
    args: [
      {
        name: '2'
      }
    ]
  });

  console.log('Result: ', result);
}

let workflowType = 'unknown-workflow-type';
workflowType = process.argv.reverse()[0];
console.log('Starting workflowtype', workflowType)

run(workflowType).catch((err) => {
  console.error(err);
  process.exit(1);
});
