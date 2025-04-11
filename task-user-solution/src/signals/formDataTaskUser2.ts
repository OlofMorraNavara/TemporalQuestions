import { defineSignal } from "@temporalio/workflow";

export const formDataTaskUser2 = defineSignal<[Record<string, any>]>(
  "formDataTaskUser2",
);
