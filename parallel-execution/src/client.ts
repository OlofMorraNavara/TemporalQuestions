import { Client } from '@temporalio/client';
import { parallelWorkflowWithPromiseAll, parallelWorkflowWithPromiseAllSettled } from './workflows';

async function run() {
  const client = new Client( {

  });


  // const secondResult = await client.workflow.execute(parallelWorkflowWithPromiseAllSettled, {
  //   taskQueue: 'parallel-execution',
  //   workflowId: 'parallel-execution-promise-all-settled-0',
  //   followRuns: true,
  //   retry: {
  //     maximumAttempts: 1,
  //   },
  //   args: [
  //     {name: ''}
  //   ]
  // });
  // console.log('Second result: ', secondResult);

  const result = await client.workflow.execute(parallelWorkflowWithPromiseAll, {
    taskQueue: 'parallel-execution',
    workflowId: 'parallel-execution-promise-all-0',
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
