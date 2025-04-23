import { sleep } from "@temporalio/activity";
import { CreateCRUDProcessInput, UpdateCRUDProcessInput } from "../types/process";


export async function create(input: CreateCRUDProcessInput): Promise<{ bdsId: string }> {
  await sleep(2000);
  return {
    bdsId: '123'
  }
}

export async function update(input: UpdateCRUDProcessInput): Promise<{ bdsId: string }> {
  await sleep(2000);
  return {
    bdsId: '123'
  }
}