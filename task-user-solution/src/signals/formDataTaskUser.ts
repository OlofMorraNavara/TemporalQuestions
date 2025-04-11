import { defineSignal } from "@temporalio/workflow";

export const formDataTaskUser = defineSignal<[Record<string, any>]>(
  "formDataTaskUser",
);
