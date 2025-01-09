# Questions about Temporal

For each question we draw a diagram which looks like the following:

```mermaid
flowchart LR
    A[A] --Transition--> B[B]
    C[C]
    B -.C1.-> C[C]
    B -.else.-x D[D]
```

```typescript
export async function workflow(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input
    }
    
    ctx = await A(ctx);
    ctx = await B(ctx);
    if (C1()) {
        ctx = await C(ctx);
    } else {
        ctx = await D(ctx);
    }
    
    return ctx;
}
```

Additionally, we will link to our own perception of the correct implementation for Temporal on how to handle the situation.
Feel free to create a PR if you have a better solution.

## How to handle 'loops'?
```mermaid
flowchart LR
    subgraph loop
        A ----> B
        B -.if C1 is true.-> A
    end
    B -.else.-x C
```

See our [our solution](./loops-solution-while) (prev. we had [a different solution](./loops-solution) as solution, but easier with a while loop) based on the [continueAsNew API](https://docs.temporal.io/dev-guide/typescript/features#continue-as-new)
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

See our [our solution](./overlapping-loops-solution-while) (prev. we had [a different solution](./overlapping-loops-solution) as solution, but easier with a while loop) based on the [continueAsNew API](https://docs.temporal.io/dev-guide/typescript/features#continue-as-new)
and [example](https://github.com/temporalio/samples-typescript/tree/main/continue-as-new).

## How to handle crossing 'loops'?
This is probably the most complex case, as it there are multiple transitions going 'backward'.

```mermaid
flowchart LR
    A ----> B
    B -.if C1 is true.-> C
    C -.if C2 is true.-> E
    C -.if C2 is false.-x A
    B -.if C1 is false.-x D
    D -.if C3 is true.-> F
    D -.if C3 is false.-x B
```

See our [our solution](./crossing-loops-solution-while) (prev. we had [a different solution](./crossing-loops-solution) as solution, but easier with a while loop) based on the [continueAsNew API](https://docs.temporal.io/dev-guide/typescript/features#continue-as-new)
and [example](https://github.com/temporalio/samples-typescript/tree/main/continue-as-new).

We prefer to name the two functions (entry point for activity) where a loop returns to as goto{ActivityName} to express that it behaves like a goto statement known in programming.