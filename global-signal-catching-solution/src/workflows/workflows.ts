import {
    ActivityCancellationType,
    CancellationScope,
    executeChild,
    isCancellation,
    ParentClosePolicy,
    proxyActivities,
    setHandler,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';
import * as signals from '../signals';
import { GlobalSignalCatcher } from './index';
import {GlobalSignalInput} from "../signals/signal-data/GlobalSignalInput";

const { StartEvent, EndEvent, LocalSignal } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

async function startGlobalListeners(ctx: WorkflowContext) {
    executeChild(GlobalSignalCatcher, {
        args: [ctx],
        workflowId: 'GlobalSignalCatcher',
        parentClosePolicy: ParentClosePolicy.TERMINATE, // TODO or abandon.
    });
}

export async function LocalSignalCatcher(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        _generated: {} as Record<string, any>,
        ...input,
    };
    await startGlobalListeners(ctx);

    ctx = await StartEvent(ctx);

    enum StateMachineActivities {
        LocalSignal = 'LocalSignal',
        EndEvent = 'EndEvent',
        exit = 'exit',
    }


    let nextActivity: StateMachineActivities = StateMachineActivities.LocalSignal;
    while (nextActivity !== StateMachineActivities.exit) {
        switch (nextActivity) {
            case StateMachineActivities.LocalSignal:

                // TODO: Local signal handler
                setHandler(signals.localSignal, (input: GlobalSignalInput) => {
                    waitingForLocalSignal = false;
                    ctx._generated.localSignalInput = input;
                });

                // TODO: Bad polling mechanism.
                let waitingForLocalSignal = true;
                while (waitingForLocalSignal) {
                    await new Promise( resolve => setTimeout(resolve, 1000));
                }

                ctx = await LocalSignal(ctx);
                nextActivity = StateMachineActivities.EndEvent;
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
    return ctx;
}
