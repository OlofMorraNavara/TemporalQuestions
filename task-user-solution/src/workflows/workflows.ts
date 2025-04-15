import {
  CancellationScope,
  condition, executeChild,
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
import { PageFlow } from "./index";

const {
  StartEvent,
  StartPageFlow,
  TaskUser,
  TaskUser2,
  TaskUser3,
  Timer,
  Timer1,
  Timer2,
  Timer3,
  EndEvent,
  EndEvent2,
} = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 3,
  },
});

export async function MainFlowTaskUser(
  input: WorkflowInput,
): Promise<WorkflowOutput> {
  let ctx: WorkflowContext = {
    _generated: {} as Record<string, any>,
    ...input,
  };

  ctx = await StartEvent(ctx);

  enum StateMachineActivities {
    StartPageFlow = "StartPageFlow",
    TaskUser = "TaskUser",
    TaskUser2 = "TaskUser2",
    TaskUser3 = "TaskUser3",
    EndEvent = "EndEvent",
    EndEvent2 = "EndEvent2",
    exit = "exit",
  }

  let nextActivity: StateMachineActivities = StateMachineActivities.StartPageFlow;
  while (nextActivity !== StateMachineActivities.exit) {
    switch (nextActivity) {
      case StateMachineActivities.StartPageFlow:

        ctx = await executeChild(PageFlow, {
          args: [ctx],
          retry: {
            maximumAttempts: 1,
          }
        }) as WorkflowContext;

        nextActivity = StateMachineActivities.TaskUser;
        break;
      case StateMachineActivities.TaskUser:
        // Signal catcher with form data.
        let formDataReceivedTaskUser = false;

        // Send start form.
        ctx = await TaskUser(ctx);

        // Handle form data signal
        setHandler(
          signals.formDataTaskUser,
          (inputTaskUser: Record<string, any>) => {
            formDataReceivedTaskUser = true;
            ctx._generated.formDataTaskUser = inputTaskUser;
          },
        );

        await condition(() => formDataReceivedTaskUser);

        nextActivity = StateMachineActivities.TaskUser2;
        break;
      case StateMachineActivities.TaskUser2:
        ctx._generated.__TimerDuration = 15000; // Normally this would be a method.

        // Define if cancellation is caught.
        let timerDoneTaskUser2 = false;

        // Signal catcher with form data.
        let formDataReceivedTaskUser2 = false;

        // Send start form.
        ctx = await TaskUser2(ctx);

        // define cancellation.
        const timerTaskUser2CancellationScope = new CancellationScope();
        const timerTaskUser2CancellationScopePromise =
          timerTaskUser2CancellationScope.run(() => Timer(ctx));
        timerTaskUser2CancellationScopePromise.then(() => {
          timerDoneTaskUser2 = true;
          // TODO: Send cancellation request to the form application.
        }).catch((err) => {
          if (!isCancellation(err)) {
            throw err;
          }
        });


        setHandler(
            signals.formDataTaskUser2, //defineSignal<[Record<string, any>]>('formDataTaskUser'
            (inputTaskUser2: Record<string, any>) => {
              formDataReceivedTaskUser2 = true;
              ctx._generated.formDataTaskUser2 = inputTaskUser2; //  TODO should be mapped
              timerTaskUser2CancellationScope.cancel();
            },
        );

        // Handle form data signal
        setHandler(
          signals.formDataTaskUser2,
          (inputTaskUser2: Record<string, any>) => {
            formDataReceivedTaskUser2 = true;
            ctx._generated.formDataTaskUser2 = inputTaskUser2; //  TODO should be mapped
            timerTaskUser2CancellationScope.cancel();
          },
        );

        // Tibco signal catcher. Comes from global signal catcher child flow.
        let tibcoSignalReceived = false;
        setHandler(signals.tibcoSignal, () => {
          tibcoSignalReceived = true;
          ctx._generated.tibcoSignalReceived = true;
          timerTaskUser2CancellationScope.cancel();
        });

        await condition(() =>
          formDataReceivedTaskUser2 || timerDoneTaskUser2 || tibcoSignalReceived
        );

        if (formDataReceivedTaskUser2) {
          nextActivity = StateMachineActivities.TaskUser3;
        } else if (tibcoSignalReceived) {
          nextActivity = StateMachineActivities.EndEvent2;
        } else if (timerDoneTaskUser2) {
          nextActivity = StateMachineActivities.EndEvent2;
        }
        break;
      case StateMachineActivities.TaskUser3:
        ctx._generated.__TimerDuration1 = 15000; // Normally this would be a method.
        ctx._generated.__TimerDuration2 = 25000; // Normally this would be a method.
        ctx._generated.__TimerDuration3 = 35000; // Normally this would be a method.
        ctx._generated.__deadlineScopeExpired = false;

        const timerScope1 = new CancellationScope();
        const timerScope2 = new CancellationScope();
        const deadlineTimerScope = new CancellationScope();

        // Define if cancellation is caught.
        let timerDoneTaskUser3 = false;

        // Send start form.
        ctx = await TaskUser3(ctx);

        const timer1Promise = timerScope1.run(() => Timer1(ctx));
        const timer2Promise = timerScope2.run(() => Timer2(ctx));
        const deadlineTimerPromise = deadlineTimerScope.run(() => Timer3(ctx));

        timer1Promise.then(() => {
          console.log("Timer1 has finished."); // Normally this could trigger a child flow.
        }).catch((err) => {
          if (!isCancellation(err)) {
            throw err;
          }
        });

        timer2Promise.then(() => {
          console.log("Timer2 has finished."); // Normally this could trigger a child flow.
        }).catch((err) => {
          if (!isCancellation(err)) {
            throw err;
          }
        });

        deadlineTimerPromise.then(() => {
          timerDoneTaskUser3 = true;
          ctx._generated.timerDoneTaskUser3 = true; // TODO: Check of deze nog gezet wordt
          // TODO: Send cancellation request to the form application.
        }).catch((err) => {
          if (!isCancellation(err)) {
            throw err;
          }
        });

        // Signal catcher with form data.
        let formDataReceivedTaskUser3 = false;

        setHandler(
          signals.formDataTaskUser3,
          (inputTaskUser3: Record<string, any>) => {
            formDataReceivedTaskUser3 = true;
            ctx._generated.formDataTaskUser3 = inputTaskUser3;
            timerScope1.cancel();
            timerScope2.cancel();
            deadlineTimerScope.cancel();
          },
        );

        await condition(() => formDataReceivedTaskUser3 || timerDoneTaskUser3);

        if (formDataReceivedTaskUser3) {
          nextActivity = StateMachineActivities.EndEvent;
        } else if (timerDoneTaskUser3) {
          nextActivity = StateMachineActivities.EndEvent2;
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
