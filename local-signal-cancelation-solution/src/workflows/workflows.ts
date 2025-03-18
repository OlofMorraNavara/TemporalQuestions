import {
    ActivityCancellationType,
    CancellationScope, executeChild, isCancellation, ParentClosePolicy,
    proxyActivities,
    setHandler,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';
import * as signals from '../signals';
import {GlobalSignalCatcherCancellation} from "./index";


const {  ToCancelActivity, ToCancelActivity2 } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
    heartbeatTimeout: '20ms',
    cancellationType: ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
});

const { StartEvent, EndEvent, EndEvent2, LocalSignal } = proxyActivities<typeof activities>({
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
            case StateMachineActivities.ToCancelActivity:
                let cancelledBySignal = false;
                const cancellationScope = new CancellationScope();
                const cancellationPromise = cancellationScope
                    .run(async () => await ToCancelActivity(ctx))
                    .catch((err) => {
                        console.warn('Caught cancellation in cancellationScope 1');
                        if (isCancellation(err)) {
                            cancelledBySignal = true;
                        }
                    });

                setHandler(signals.cancelSignal, () => {
                    ctx._generated.handlerCancelation = true;
                    console.warn('Local cancellation signal caught in handler 1')
                    cancellationScope.cancel()
                });

                await cancellationPromise;

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
                const cancellation2Promise = cancellationScope2
                    .run(async () => await ToCancelActivity2(ctx))
                    .catch((err) => {
                        console.warn('Caught cancellation in cancellationScope 2');
                        if (isCancellation(err)) {
                            cancelledBySignal2 = true;
                        }
                    });

                setHandler(signals.cancelSignal, () => {
                    ctx._generated.handlerCancelation2 = true;
                    console.log('Local cancellation signal caught in handler 2')
                    cancellationScope2.cancel();
                });

                await cancellation2Promise;

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
