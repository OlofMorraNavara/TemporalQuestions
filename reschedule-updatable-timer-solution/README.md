# Reschedule timer implementation

## Prerequisites

1. Node 22

## Installation

In order to install all dependencies and format all files, run the following
command:

```shell
chmod +x install.sh && ./install.sh
```

### Running this sample

1. `temporal server start-dev` to start
   [Temporal Server](https://github.com/temporalio/cli/#installation).
2. In another shell, `npm run start.watch` to start the Worker.
3. In another shell, `npm run workflow` to run the Workflow Client.
4. Send a signal containing form data from the Temporal Web UI to the running
   workflow.

### Workflow

In this example, one form is initiated with a timer attached to it.
Also, a signal is attached to reschedule the timer.
It uses the temporalio UpdatableTimer feature to reschedule the timer
when a signal is received.

### Workflow diagram

```mermaid
graph RL;
   Start --> TaskUser;
   TaskUser --> End;
   Timer -..-|Targets| TaskUser;
   Signal -..-|Targets| TaskUser;
   Signal -..-|Reschedules| Timer;
   Timer --> End2;

```
