import {
    CancellationScope,
    isCancellation,
    proxyActivities,
    defineSignal,
    setHandler,
    condition,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';
import * as signals from '../signals';
import type * as timerDurations from '../timerDurations';
import {DateTime} from "luxon";
import {UpdatableTimer} from "../utils/UpdatableTimer";

const { StartEvent, TaskUser, Timer, EndEvent, EndEvent2 } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

const { determineTimerDuration, determineRescheduleTimerDuration } = proxyActivities<typeof timerDurations>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

export async function MainFlowRescheduleTimer(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input,
    };
    ctx = await StartEvent(ctx);
    ctx = await TaskUser(ctx);

    // Timer
    const timerDurationTimer = await determineTimerDuration(ctx)
    let __deadlineScopeExpiredTimer = false;

    console.log("First deadline duration expires at:", timerDurationTimer.getMilliseconds() ,DateTime.now().plus(timerDurationTimer.getMilliseconds()))
    const deadlineTimerScopeTimer = new CancellationScope();
    const target = Date.now()  + timerDurationTimer.getMilliseconds()

    const updatableTimer = new UpdatableTimer(target);
    const deadlineTimerPromiseTimer = deadlineTimerScopeTimer
        .run(async () => {
            ctx._generated.firstExperation = DateTime.now().plus(timerDurationTimer.getMilliseconds());
            await updatableTimer;
            __deadlineScopeExpiredTimer = true;
            ctx._generated.actualExperation = DateTime.now();
        })
        .catch((err: any) => {
            if (!isCancellation(err)) {
                throw err;
            }
        });

    // Task User submit signal handler
    let formDataReceivedTaskUser = false;
    setHandler(defineSignal<[Record<string, any>]>('formDataTaskUser'), (inputTaskUser: Record<string, any>) => {
        deadlineTimerScopeTimer.cancel();
        formDataReceivedTaskUser = true;
    });

    // Timer reschedule signal handler. Is a signal activity.
    setHandler(signals.UpdateTimer, async () => {
        const newDuration = await determineRescheduleTimerDuration(ctx)
        const newTarget = Date.now() + newDuration.getMilliseconds();
        console.log("New deadline duration expires at:", newDuration.getMilliseconds(), DateTime.now().plus(newDuration.getMilliseconds()))
        updatableTimer.deadline = newTarget;
    });

    await condition(() => __deadlineScopeExpiredTimer || formDataReceivedTaskUser);

    if (__deadlineScopeExpiredTimer) {
        ctx = await EndEvent2(ctx);
    } else if (formDataReceivedTaskUser) {
        ctx = await EndEvent(ctx);
    }

    return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated,
    };
}


