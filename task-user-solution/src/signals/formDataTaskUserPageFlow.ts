import { defineSignal } from "@temporalio/workflow";

export const formDataTaskUserPageFlow = defineSignal<[Record<string, any>]>(
  "formDataTaskUserPageFlow",
);
