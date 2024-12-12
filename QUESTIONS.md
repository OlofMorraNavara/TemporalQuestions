# Questions about Temporal

For each question we draw a diagram which looks like the following:

```mermaid
flowchart LR
    A[Activity] --Transition--> B[Activity]
    C[Activity]
    B -.C1.-> C[Activity]
    B -.else.-x D[Activity]
```

Additionally, we will link to our own perception of the correct implementation for Temporal on how to handle the situation.
Feel free to create a PR if you have a better solution.

## How to handle 'loops'?
```mermaid
flowchart LR
    A ----> B
    C
    B -.if C1 is true.-> A
    B -.else.-x C
```

See [our solution](./loops-solution) based on the [continueAsNew API](https://docs.temporal.io/dev-guide/typescript/features#continue-as-new)
 and [example](https://github.com/temporalio/samples-typescript/tree/main/continue-as-new).