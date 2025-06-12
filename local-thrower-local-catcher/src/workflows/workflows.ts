import {
    workflowInfo,
    proxyActivities,
    CancellationScope,
    isCancellation,
    getExternalWorkflowHandle,
    setHandler,
    condition,
    defineSignal,
    uuid4,
    sleep, ParentClosePolicy, startChild
} from '@temporalio/workflow';
import type * as activities from '../activities';
import type * as timerDurations from '../timerDurations';
import * as signals from '../signals';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import { Log, DateTimeUtil, ScriptUtil } from '../utils/index';
import { ApplicationFailure } from '@temporalio/common';
import { localSignalOrchestrator } from './index';

const { EndEvent, EndEvent2, EndEvent3, StartEvent, TaskUser, LocalSignal } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

async function startLocalSignalOrchestrator(ctx: WorkflowContext) {
    ctx._generated.startLocalSignalOrchestrator = 'localSignalWorkflowId-' + uuid4();
    await startChild(
        localSignalOrchestrator,
        {
            args: [{
                signals: [],
                mainWorkflowId: ctx._generated.mainParentProcessWorkflowId,
            }],
            workflowId: ctx._generated.startLocalSignalOrchestrator,
            parentClosePolicy: ParentClosePolicy.ABANDON
        }
    );
}

export async function ThrowLocalCatchLocal(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input,
    };
    // Local signal thrower and catchers in this workflow:
    // signals.signal
    // Cather: on TaskUserActivity
    // Thrower: on IntermediateTimerActivity
    await startLocalSignalOrchestrator(ctx);

    ctx = await StartEvent(ctx);
    ctx = await TaskUser(ctx);
    // const __timerDurationdeadlineTimer = await determineTimerDurationdeadlineTimer(ctx);
    let __deadlineScopeExpireddeadlineTimer = false;
    const deadlineTimerScopedeadlineTimer = new CancellationScope();

    deadlineTimerScopedeadlineTimer
        .run(async () => {
            console.log('Starting deadline timer for 5 seconds');
            await sleep(5000); // TODO Deadline hardcoded
            __deadlineScopeExpireddeadlineTimer = true;
            console.log('Deadline timer expired.');
        })
        .catch((err: any) => {
            if (!isCancellation(err)) {
                throw err;
            }
        });

    let formDataReceivedtaskUser = false;
    setHandler(defineSignal<[Record<string, any>]>('formDatataskUser'), (inputtaskUser: Record<string, any>) => {
        deadlineTimerScopedeadlineTimer.cancel();
        formDataReceivedtaskUser = true;
    });

    setHandler(signals.signal1, async () => {
        console.log('Signal1 callback: Move to EndEvent2 after receiving local signal2');
        ctx = await EndEvent2(ctx);
    });

    await condition(() => __deadlineScopeExpireddeadlineTimer || formDataReceivedtaskUser);

    if (__deadlineScopeExpireddeadlineTimer) {
        console.log('Signal1 callback: deadline expired, throwing local signal1');

        await getExternalWorkflowHandle(ctx._generated.startLocalSignalOrchestrator).signal(signals.signal1);

        ctx = await EndEvent2(ctx);

        console.log('Signal1 callback: stopping child workflows');
        await stopChildWorkflows(ctx);
        return mapContextToOutput(ctx);
    }

    await stopChildWorkflows(ctx);
    return mapContextToOutput(ctx);
}
function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated,
    };
}
async function stopChildWorkflows(ctx: any) {
    try {
        await getExternalWorkflowHandle(ctx._generated.startLocalSignalOrchestrator).signal(
            'mainFlowDoneSignal'
        );
    } catch (err) {
        if (err instanceof ApplicationFailure && err.type != 'ExternalWorkflowExecutionNotFound') {
            throw err;
        }
    }
}
