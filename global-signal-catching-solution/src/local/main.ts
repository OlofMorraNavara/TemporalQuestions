import { createLocalConnection, createWorker } from "../worker";
import { getLocalConfig } from "../config/config";

async function main() {
  const connection = await createLocalConnection();
  const worker = await createWorker(connection, getLocalConfig());

  worker.run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
