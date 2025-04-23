import { ApplicationFailure, sleep, } from "@temporalio/activity";
import { BPMProcessStatusResult, CreateCRUDProcessInput, UpdateCRUDProcessInput } from "../types/process";

export async function createBPMCRUDProcess(input: CreateCRUDProcessInput | UpdateCRUDProcessInput) {
  // Simulate creating a BPM process
  await sleep(2000);
  return { pvmId: 'pvm-12345' };
}

export async function waitForBPMCRUDProcess(pvmId: string): Promise<{ status: BPMProcessStatusResult }> {
  // check if the BPM process is completed
  const isComplete = false;
  await sleep(1000);

  if (!isComplete) {
    throw ApplicationFailure.create({
      nextRetryDelay: '30 seconds',
      type: 'retry',
      nonRetryable: false,
      message: `BPM process with ID ${pvmId} is not completed`,
    })
  }

  return {
    status: 'COMPLETED'
  }
}