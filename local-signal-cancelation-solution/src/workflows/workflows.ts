import {
    CancellationScope, executeChild, isCancellation, ParentClosePolicy,
    proxyActivities,
    setHandler, startChild,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';
import * as signals from '../signals';
import * as workflows from '../workflows';
import {GlobalSignalCatcherCancellation} from "./index";

const { StartEvent, EndEvent, EndEvent2, ToCancelActivity, LocalSignal } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

async function startGlobalListeners(ctx: WorkflowContext) {
    executeChild(GlobalSignalCatcherCancellation, {
        args: [ctx],
        workflowId: 'GlobalSignalCatcherCancellation',
        parentClosePolicy: ParentClosePolicy.TERMINATE, // TODO or abandon.
    });
}

export async function LocalSignalCancellation(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        _generated: {} as Record<string, any>,
        ...input,
    };

    ctx = await StartEvent(ctx);

    enum StateMachineActivities {
        LocalSignal = 'LocalSignal',
        ToCancelActivity = 'ToCancelActivity',
        EndEvent = 'EndEvent',
        EndEvent2 = 'EndEvent2',
        exit = 'exit',
    }

    let nextActivity: StateMachineActivities = StateMachineActivities.ToCancelActivity;
    while (nextActivity !== StateMachineActivities.exit) {
        switch (nextActivity) {
            // TODO: Activity with cancellation signal.
            case StateMachineActivities.ToCancelActivity:
                let cancelledBySignal = false;
                const cancellationScope = new CancellationScope();

                // TODO But what if the signal could be handled by 2 different activities? Can a handler be cancelled?
                setHandler(signals.cancelSignal, () => {
                    // TODO: Cancel the activity. Does not cancel atm.
                    //  What to do with the cancellation script?
                    ctx._generated.handlerCancelation = true;
                    cancellationScope.cancel();
                });

                await cancellationScope.run(async () =>
                {
                    await startGlobalListeners(ctx);
                    ctx = await ToCancelActivity(ctx)
                    // TODO Stop global listener??
                }
                ).catch((err) => {
                    if (isCancellation(err)) {
                        cancelledBySignal = true;
                    } else {
                        throw err;
                    }
                });

                ctx._generated.cancelledBySignal = cancelledBySignal;

                if (cancelledBySignal) {
                    nextActivity = StateMachineActivities.LocalSignal; // TODO because signal catcher can contain scripts?
                }
                else{
                    nextActivity = StateMachineActivities.EndEvent;
                }
                break;
            case StateMachineActivities.LocalSignal:
                ctx = await LocalSignal(ctx);
                nextActivity = StateMachineActivities.EndEvent2;
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
