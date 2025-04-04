import {
  ApplicationFailure,
  CancellationScope,
  ChildWorkflowCancellationType,
  defineSignal,
  executeChild,
  getExternalWorkflowHandle,
  isCancellation,
  ParentClosePolicy,
  proxyActivities,
  setHandler,
  sleep,
  startChild,
} from "@temporalio/workflow";
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowOutput,
} from "../types/context";
import type * as activities from "../activities";
import * as signals from "../signals";
import { GlobalSignalCatcher, GlobalSignalThrower } from "./index";
import { GlobalSignalInput } from "../signals/signal-data/GlobalSignalInput";

const { StartEvent, EndEvent, EndEvent2, LocalSignal } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 3,
  },
});

async function startGlobalListeners(ctx: WorkflowContext) {
  startChild(GlobalSignalCatcher, {
    args: [ctx],
    workflowId: "GlobalSignalCatcher",
    parentClosePolicy: ParentClosePolicy.ABANDON,
  });
}

async function startGlobalThrower(ctx: WorkflowContext) {
  startChild(GlobalSignalThrower, {
    args: [ctx],
    workflowId: "GlobalSignalThrower",
    parentClosePolicy: ParentClosePolicy.ABANDON,
  });
}

export async function LocalSignalCatcher(
  input: WorkflowInput,
): Promise<WorkflowOutput> {
  let ctx: WorkflowContext = {
    _generated: {} as Record<string, any>,
    ...input,
  };
  await startGlobalListeners(ctx);
  //await startGlobalThrower(ctx);

  ctx = await StartEvent(ctx);

  enum StateMachineActivities {
    LocalSignal = "LocalSignal",
    EndEvent = "EndEvent",
    EndEvent2 = "EndEvent2",
    exit = "exit",
  }

  let nextActivity: StateMachineActivities = StateMachineActivities.LocalSignal;
  while (nextActivity !== StateMachineActivities.exit) {
    switch (nextActivity) {
      case StateMachineActivities.LocalSignal:
        const cancellationScope = new CancellationScope();

        const cancellationScopePromise = cancellationScope
          .run(async () => {
            ctx = await LocalSignal(ctx);
          }).catch((err) => {
            if (isCancellation(err)) {
              if (localSignalCaught) {
                nextActivity = StateMachineActivities.EndEvent2;
              }
            } else {
              throw err;
            }
          });

        // TODO: Local signal catcher.
        let localSignalCaught = false;
        setHandler(defineSignal("localSignalCatcher"), () => {
          localSignalCaught = true;
          // TODO: Cancel
          cancellationScope.cancel();
          // TODO: Reschedule
          // ......
        });

        await cancellationScopePromise;

        if (localSignalCaught) {
          nextActivity = StateMachineActivities.EndEvent2;
        } else {
          nextActivity = StateMachineActivities.EndEvent;
        }
        break;
      case StateMachineActivities.EndEvent:
        ctx = await EndEvent(ctx);
        nextActivity = StateMachineActivities.exit;
        break;
      default:
        nextActivity = StateMachineActivities.exit;
        break;
    }
  }

  // TODO: Send done signal to global signal catchers.
  try {
    await getExternalWorkflowHandle("GlobalSignalCatcher").signal(
      defineSignal("localSignalCatcherDone"),
    );
  } catch (err) {
    if (err.type != "ExternalWorkflowExecutionNotFound") {
      throw err;
    }
  }

  return ctx;
}
