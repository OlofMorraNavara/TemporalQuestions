import {
    allHandlersFinished,
    CancellationScope, executeChild, inWorkflowContext, isCancellation, ParentClosePolicy,
    proxyActivities,
    setHandler, startChild,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';
import * as signals from '../signals';
import {GlobalSignalCatcherCancellation} from "./index";

const { StartEvent, EndEvent, EndEvent2, ToCancelActivity, ToCancelActivity2, LocalSignal } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
    heartbeatTimeout: '35s',
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
    await startGlobalListeners(ctx);

    ctx = await StartEvent(ctx);

    enum StateMachineActivities {
        LocalSignal = 'LocalSignal',
        ToCancelActivity = 'ToCancelActivity',
        ToCancelActivity2 = 'ToCancelActivity2',
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

                setHandler(signals.cancelSignal, () => {
                    // TODO: Cancel the activity. Does not cancel atm.
                    //  What to do with the cancellation script?
                    ctx._generated.handlerCancelation = true;
                    console.log('oli4 komt in handler 1')
                    cancellationScope.cancel()
                });

                await cancellationScope
                    .run(async () => await ToCancelActivity(ctx))
                    .catch((err) => {
                        console.log('oli5 komt in catch 1', err.constructor.name, err.message, err.stack);
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
                    nextActivity = StateMachineActivities.ToCancelActivity2;
                }
                break;
            case StateMachineActivities.LocalSignal:
                ctx = await LocalSignal(ctx);
                nextActivity = StateMachineActivities.EndEvent2;
                break;
            case StateMachineActivities.ToCancelActivity2:
                let cancelledBySignal2 = false;
                const cancellationScope2 = new CancellationScope();

                setHandler(signals.cancelSignal, () => {
                    // TODO: Cancel the activity. Does not cancel atm.
                    //  What to do with the cancellation script?
                    ctx._generated.handlerCancelation2 = true;
                    console.log('oli4 komt in handler 2')
                    cancellationScope2.cancel();
                });

                await cancellationScope2
                    .run(async () => await ToCancelActivity2(ctx))
                    .catch((err) => {
                        console.log('oli5 komt in catch 2', err.constructor.name, err.message, err.stack);
                        if (isCancellation(err)) {
                            cancelledBySignal2 = true;
                        } else {
                            throw err;
                        }
                    });

                ctx._generated.cancelledBySignal2 = cancelledBySignal2;

                if (cancelledBySignal2) {
                    nextActivity = StateMachineActivities.LocalSignal; // TODO because signal catcher can contain scripts?
                }
                else{
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
