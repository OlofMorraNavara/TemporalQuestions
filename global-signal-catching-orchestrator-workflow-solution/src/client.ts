import { Client, Connection } from "@temporalio/client";
import { OrchestratorWorkflow } from "./workflows";
import { nanoid } from "nanoid";
import { WorkflowInput, WorkflowOutput } from "./types/context";

async function run(input: WorkflowInput): Promise<WorkflowOutput> {
  // Connect to the default Server location
  const connection = await Connection.connect({ address: "localhost:7233" });
  // In production, pass options to configure TLS and other settings:
  // {
  //   address: 'foo.bar.tmprl.cloud',
  //   tls: {}
  // }

  const client = new Client({
    connection,
    namespace: "default",
    dataConverter: {
      payloadConverterPath: require.resolve("./payload-converter"),
    },
  });

  // Construct workflow ID, and add to the input.
  const workflowId = "workflow-orchestrator-" + nanoid();
  input._generated.orchestratorProcessWorkflowId = workflowId;

  const handle = await client.workflow.start(OrchestratorWorkflow, {
    taskQueue: "local-queue",
    args: [input],
    // in practice, use a meaningful business ID, like customerId or transactionId
    workflowId: workflowId,
  });

  console.log(`Started workflow ${handle.workflowId}`);

  return await handle.result();
}

const input: WorkflowInput = {
  _generated: {} as Record<string, any>,
};

run(input).catch((err) => {
  console.error(err);
  process.exit(1);
});
