import { executeChild, ParentClosePolicy, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';

const { StartEvent, EndEvent, TimedActivity, NormalActivity, Timer1, Timer2, Timer3, Extra1, Extra2, EndEvent2 } =
    proxyActivities<typeof activities>({
        startToCloseTimeout: '1 minute',
        retry: {
            maximumAttempts: 3,
        },
    });

export async function TimerProcess(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        _generated: {} as Record<string, any>,
        ...input,
    };
    ctx = await StartEvent(ctx);

    enum StateMachineActivities {
        TimedActivity = 'TimedActivity',
        NormalActivity = 'NormalActivity',
        EndEvent = 'EndEvent',
        EndEvent2 = 'EndEvent2',
        exit = 'exit',
    }

    let nextActivity: StateMachineActivities = StateMachineActivities.TimedActivity;
    while (nextActivity !== StateMachineActivities.exit) {
        switch (nextActivity) {
            case StateMachineActivities.TimedActivity:
                ctx._generated.__TimerDuration1 = await __DetermineDeadlineTimer1(ctx);
                ctx._generated.__TimerDuration2 = await __DetermineDeadlineTimer2(ctx);
                ctx._generated.__TimerDuration3 = await __DetermineDeadlineTimer3(ctx);

                const timedPromise = TimedActivity(ctx);

                // TODO: Timer 1, Run extra activity 1. Continue on timout = true.
                const race1 = Promise.race([timedPromise, Timer1(ctx)]).then(async (result) => {
                    if (result._generated.Timer1Timeout) {
                        executeChild(Timer1Child, {
                            args: [ctx],
                            parentClosePolicy: ParentClosePolicy.ABANDON,
                        });
                    }
                });

                // TODO: Timer 2, Run extra activity 2. Continue on timout = true.
                const race2 = Promise.race([timedPromise, Timer2(ctx)]).then(async (result) => {
                    if (result._generated.Timer2Timeout) {
                        executeChild(Timer2Child, {
                            args: [ctx],
                            parentClosePolicy: ParentClosePolicy.ABANDON,
                        });
                    }
                });

                // TODO: Timer 3, New timer event flow. ActivityDeadline + continue on timeout false.
                const race3 = Promise.race([timedPromise, Timer3(ctx)]).then(async (result) => {
                    ctx = result;
                });

                // TODO: Race 3 timers.
                await Promise.all([race1, race2, race3]);

                if (ctx._generated.Timer3Timeout) {
                    nextActivity = StateMachineActivities.EndEvent2;
                    break;
                }
                nextActivity = StateMachineActivities.NormalActivity;
                break;
            case StateMachineActivities.NormalActivity:
                ctx = await NormalActivity(ctx);
                nextActivity = StateMachineActivities.EndEvent;
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
    return mapContextToOutput(ctx);
}

export async function Timer1Child(ctx: WorkflowContext): Promise<WorkflowOutput> {
    ctx = await Extra1(ctx);
    return ctx;
}

export async function Timer2Child(ctx: WorkflowContext): Promise<WorkflowOutput> {
    ctx = await Extra2(ctx);
    return ctx;
}

// Determine timer deadlines:
async function __DetermineDeadlineTimer1(ctx: WorkflowContext) {
    // DeadlineDuration script 1
    return 2000;
}
async function __DetermineDeadlineTimer2(ctx: WorkflowContext) {
    // DeadlineDuration script 2
    return 7000;
}
async function __DetermineDeadlineTimer3(ctx: WorkflowContext) {
    // DeadlineDuration script 3
    return 10000;
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated,
    };
}
