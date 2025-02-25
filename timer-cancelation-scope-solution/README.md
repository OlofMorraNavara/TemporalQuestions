# Intermediate timers using cancellation scopes

This is the default project that is scaffolded out when you run `.......`.

## Prerequisites

1. Node 22

## Installation

In order to install all dependencies and format all files, run the following command:

```shell
chmod +x install.sh && ./install.sh
```

### Running this sample

1. `temporal server start-dev` to start [Temporal Server](https://github.com/temporalio/cli/#installation).
2. `npm run start.watch` to start the Worker.
3. In another shell, `npm run workflow` to run the Workflow Client.
4. In another shell, `npm run cancel-workflow {workflowId}` to cancel the Workflow Client.

### Workflow

```mermaid
graph LR;
  A[Start] --> B[TimedActivity];
  B --> C[NormalActivity];
  C --> D[End];
  Timer1[Timer 1] -..-|Target| B;
  Timer2[Timer 2] -..-|Target| B;
  Timer3[Timer 3] -..-|Target| B;
  Timer1 --> |Continues flow and executes| F1[Extra1];
  Timer2 --> |Continues flow and executes| F2[Extra2];
  Timer3 --> |ContinueOnTimeout = false| E[End2];

  subgraph Normal flow
      A
      B
      C
      D
  end

  subgraph ActivityDeadlineEvent
      Timer3
  end
  subgraph Timer 1 + extra 1
      Timer1
      F1
  end
  subgraph Timer 2 + extra 2
      Timer2
      F2
  end
```
