import { proxyActivities, CancellationScope, isCancellation, ParentClosePolicy, startChild, executeChild, ActivityCancellationType, ChildWorkflowCancellationType, getExternalWorkflowHandle, setHandler, condition, defineSignal, uuid4, sleep } from "@temporalio/workflow";
import type * as activities from "../activities";
import type * as timerDurations from "../timerDurations";
import * as signals from "../signals";
import { WorkflowContext, WorkflowInput, WorkflowOutput } from "../types/context";
import { Log, DateTimeUtil, ScriptUtil } from "../utils/index";
import { ApplicationFailure } from "@temporalio/common";
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
    const handle = getExternalWorkflowHandle(ctx._generated.mainParentWorkflowId);
    await handle.signal(signals.signal);
}
export async function ThrowLocalCatchLocal(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
            ...input
    };
    ctx = await StartEvent(ctx);
    ctx = await TaskUser(ctx);
    const __timerDurationdeadlineTimer = await determineTimerDurationdeadlineTimer(ctx);
    let __deadlineScopeExpireddeadlineTimer = false;
    const deadlineTimerScopedeadlineTimer = new CancellationScope();
    const deadlineTimerPromisedeadlineTimer = deadlineTimerScopedeadlineTimer.run(async () => {
        await sleep(__timerDurationdeadlineTimer.getMilliseconds());
        __deadlineScopeExpireddeadlineTimer = true;
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
    setHandler(signals.signal, () => {
        deadlineTimerScopedeadlineTimer.cancel();
        receivedtaskUserLocalSignal1 = true;
    });
    await condition(() => __deadlineScopeExpireddeadlineTimer || formDataReceivedtaskUser || receivedtaskUserLocalSignal1);
    if (__deadlineScopeExpireddeadlineTimer) {
        await throwLocalSignal_LocalSignal1(ctx);
        ctx = await EndEvent2(ctx);
        return mapContextToOutput(ctx);
    }
    else if (receivedtaskUserLocalSignal1) {
        ctx = await EndEvent(ctx);
        return mapContextToOutput(ctx);
    }
    return mapContextToOutput(ctx);
}
function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated
    };
}
