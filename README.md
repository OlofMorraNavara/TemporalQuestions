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
    B -.if C1 is true.-> A
    B -.else.-x C
```

See [our solution](./loops-solution) based on the [continueAsNew API](https://docs.temporal.io/dev-guide/typescript/features#continue-as-new)
 and [example](https://github.com/temporalio/samples-typescript/tree/main/continue-as-new).

## How to handle overlapping 'loops'?
```mermaid
graph LR
    A
    A ----> B
    subgraph childWorkflow
        direction LR
        B
        B ----> C
        C -.if C1 is true.-x B
    end
    D
    C -.else.-> D
    D -.if C2 is true.-> E
    D -.else.-x A
```

See [our solution](./overlapping-loops-solution) based on the [continueAsNew API](https://docs.temporal.io/dev-guide/typescript/features#continue-as-new)
and [example](https://github.com/temporalio/samples-typescript/tree/main/continue-as-new).

## How to handle crossing 'loops'?
This is probably the most complex case, as it there are multiple transitions going 'backward'.

```mermaid
flowchart LR
    A ----> B
    B ----> C
    C -.if C1 is true.-> D
    D -.if C2 is true.-> G
    D -.else.-x A
    C -.else.-x E
    E -.if C3 is true.-> F
    E -.else.-x B
```

See [our solution](./crossing-loops-solution) based on the [continueAsNew API](https://docs.temporal.io/dev-guide/typescript/features#continue-as-new)
and [example](https://github.com/temporalio/samples-typescript/tree/main/continue-as-new).