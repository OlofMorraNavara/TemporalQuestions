import {
  CancellationScope,
  isCancellation,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowOutput,
} from "../types/context";
import type * as activities from "../activities";
import * as signals from "../signals";

const { StartEvent, EndEvent, EndEvent2, LocalSignal, LocalSignalTarget } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minute",
    retry: {
      maximumAttempts: 3,
    },
  });

export async function LocalSignalCatcher(
  input: WorkflowInput,
): Promise<WorkflowOutput> {
  let ctx: WorkflowContext = {
    _generated: {} as Record<string, any>,
    ...input,
  };

  ctx = await StartEvent(ctx);

  enum StateMachineActivities {
    LocalSignalTarget = "LocalSignalTarget",
    LocalSignal = "LocalSignal",
    EndEvent = "EndEvent",
    EndEvent2 = "EndEvent2",
    exit = "exit",
  }

  let nextActivity: StateMachineActivities =
    StateMachineActivities.LocalSignalTarget;
  while (nextActivity !== StateMachineActivities.exit) {
    switch (nextActivity) {
      case StateMachineActivities.LocalSignalTarget:
        // TODO: Local signal init script also should be executed.

        // TODO: Reschedule timer, cancel target, and possibly set next activity.
        const cancellationScope = new CancellationScope();
        const cancellationScopePromise = cancellationScope
          .run(async () => {
            ctx = await LocalSignalTarget(ctx);
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
        setHandler(signals.localSignal, () => {
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
      case StateMachineActivities.EndEvent2:
        ctx = await EndEvent2(ctx);
        nextActivity = StateMachineActivities.exit;
        break;
      default:
        nextActivity = StateMachineActivities.exit;
        break;
    }
  }
  return ctx;
}
