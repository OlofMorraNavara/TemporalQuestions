import {
    proxyActivities,
    CancellationScope,
    isCancellation,
    getExternalWorkflowHandle,
    setHandler,
    condition,
    defineSignal,
    uuid4,
    sleep,
    workflowInfo
} from '@temporalio/workflow';
import type * as activities from "../activities";
import type * as timerDurations from "../timerDurations";
import * as signals from "../signals";
import { WorkflowContext, WorkflowInput, WorkflowOutput } from "../types/context";
import { Log, DateTimeUtil, ScriptUtil } from "../utils/index";

const { EndEvent, EndEvent2, StartEvent, TaskUser, LocalSignal } = proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minute",
    retry: {
        maximumAttempts: 3
    }
});
const { determineTimerDurationdeadlineTimer } = proxyActivities<typeof timerDurations>({
    startToCloseTimeout: "1 minute",
    retry: {
        maximumAttempts: 3
    }
});

export async function throwLocalSignal_LocalSignal1(ctx: WorkflowContext) {
    // console.log('Throwing local signal from workflow:', workflowInfo().workflowId);
    //
    // const handle = getExternalWorkflowHandle(workflowInfo().workflowId, workflowInfo().runId);
    //
    // if(handle == null){
    //     console.log("Handle is not found, cannot throw local signal.");
    // }
    // else{
    //     console.log("Workflow handle found, throwing local signal.");
    // }
    //
    // await handle?.signal(signals.signal);
}

export async function ThrowLocalCatchLocal(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
            ...input
    };
    ctx._generated


    ctx = await StartEvent(ctx);
    ctx = await TaskUser(ctx);
    // const __timerDurationdeadlineTimer = await determineTimerDurationdeadlineTimer(ctx);
    let __deadlineScopeExpireddeadlineTimer = false;
    const deadlineTimerScopedeadlineTimer = new CancellationScope();

    deadlineTimerScopedeadlineTimer.run(async () => {
        console.log("Starting deadline timer for 5 seconds");
        await sleep(5000); // TODO Deadline hardcoded
        __deadlineScopeExpireddeadlineTimer = true;
        console.log("Deadline timer expired.");
    }).catch((err: any) => {
        if (!isCancellation(err)) {
            throw err;
        }
    });

    let formDataReceivedtaskUser = false;
    setHandler(defineSignal<[Record<string, any>]>("formDatataskUser"), (inputtaskUser: Record<string, any>) => {
        deadlineTimerScopedeadlineTimer.cancel();
        formDataReceivedtaskUser = true;
    });

    let receivedtaskUserLocalSignal1 = false;
    setHandler(signals.signal, async () => {
        deadlineTimerScopedeadlineTimer.cancel();
        receivedtaskUserLocalSignal1 = true;
        console.log("Signal caught in handler ")
        await sleep(10000);
        await EndEvent(ctx);
    });

    await condition(() => __deadlineScopeExpireddeadlineTimer || formDataReceivedtaskUser || receivedtaskUserLocalSignal1);

    if (__deadlineScopeExpireddeadlineTimer) {
        console.log('Throwing signal')
        console.log('sleeping....')
        await sleep(10000);
        console.log('woke up from sleep')
        ctx = await EndEvent2(ctx);
        return mapContextToOutput(ctx);
    }
    // else if (receivedtaskUserLocalSignal1) {
    //     ctx = await EndEvent(ctx);
    //     return mapContextToOutput(ctx);
    // }
    return mapContextToOutput(ctx);
}
function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated
    };
}
