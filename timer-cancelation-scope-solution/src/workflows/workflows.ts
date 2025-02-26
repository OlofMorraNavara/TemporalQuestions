import {
    CancellationScope,
    executeChild, isCancellation,
    ParentClosePolicy,
    proxyActivities
} from '@temporalio/workflow';
import type * as activities from '../activities';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';

const { StartEvent, EndEvent, TimedActivity, NormalActivity, Timer1, Timer2, Timer3, Extra1, Extra2, EndEvent2 } =
    proxyActivities<typeof activities>({
        startToCloseTimeout: '1 minute',
        retry: {
            maximumAttempts: 3,
        },
    });


export async function TimerProcessCancellationScopes(input: WorkflowInput): Promise<WorkflowOutput> {
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
                ctx._generated.__deadlineScopeExpired = false;

                const timedActivityScope = new CancellationScope();
                const timerScope1 = new CancellationScope();
                const timerScope2 = new CancellationScope();
                const deadlineTimerScope = new CancellationScope();

                const timedActivityPromise = timedActivityScope.run(() => TimedActivity(ctx));
                const timer1Promise = timerScope1.run(() => Timer1(ctx));
                const timer2Promise = timerScope2.run(() => Timer2(ctx));
                const timer3Promise = deadlineTimerScope.run(() => Timer3(ctx));

                async function handleTimer(timerPromise: Promise<WorkflowContext>, childWorkflow: (ctx: WorkflowContext) => Promise<WorkflowOutput>, timerName: string) {
                    try {
                        await timerPromise;
                        console.log(`childworkflow voor ${timerName} gestart`);
                        executeChild(childWorkflow, {
                            args: [ctx],
                            parentClosePolicy: ParentClosePolicy.ABANDON,
                        });
                    } catch (err) {
                        if (isCancellation(err)) {
                            console.log(`Timer ${timerName} is gecanceled`);
                        } else {
                            throw err;
                        }
                    }
                }

                handleTimer(timer1Promise, Timer1Child, 'Timer1');
                handleTimer(timer2Promise, Timer2Child, 'Timer2');

                timer3Promise.then(() => {
                    console.log("deadline bereikt TimedActivity wordt gecanceled");
                    ctx._generated.__deadlineScopeExpired = true;
                    timedActivityScope.cancel();
                }).catch((err) => {
                    if (isCancellation(err)) {
                        console.log(`Timer Timer3 is gecanceled`);
                    } else {
                        throw err;
                    }
                });

                try {
                    await timedActivityPromise;
                    console.log("TimedActivity done, resterende timers worden gecanceled");
                    timerScope1.cancel();
                    timerScope2.cancel();
                    deadlineTimerScope.cancel();
                } catch (err) {
                    if (isCancellation(err)) {
                        console.log("TimedActivity is gecancelled door een timer");
                    } else {
                        throw err;
                    }
                }

                if(ctx._generated.__deadlineScopeExpired) {
                    nextActivity = StateMachineActivities.EndEvent2;
                }
                else{
                    nextActivity = StateMachineActivities.NormalActivity;
                }
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
    return 3000;
}
async function __DetermineDeadlineTimer2(ctx: WorkflowContext) {
    // DeadlineDuration script 2
    return 5000; // TODO: wanneer dit gelijk is aan de timedActivity duration zal deze alsnog aflopen en dus een childflow starten.
}
async function __DetermineDeadlineTimer3(ctx: WorkflowContext) {
    // DeadlineDuration script 3
    return 7000;
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated,
    };
}
