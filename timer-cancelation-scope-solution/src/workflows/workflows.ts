import {
    ActivityFailure,
    CancellationScope,
    CancelledFailure,
    executeChild,
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

                // TODO timedActivityScope
                await timedActivityScope.run(async () => {
                    const deadlineScope = new CancellationScope();

                    // TODO deadlineScope
                    const deadlineScopePromise = deadlineScope.run(async () => {
                        const timedActivityPromise = TimedActivity(ctx)
                            .then(() => {
                                nextActivity = StateMachineActivities.NormalActivity;
                                console.log('Olivier timedActivityScope cancelled');
                                deadlineScope.cancel();
                                timedActivityScope.cancel();
                            });

                        const deadlineTimerPromise = Timer3(ctx)
                            .then(async (result) => {
                                ctx = result;
                                console.log('Olivier deadlineScope cancelled');
                                deadlineScope.cancel();
                        });

                        await Promise.all([timedActivityPromise, deadlineTimerPromise]);

                    }).catch((err) => {
                        console.log('Olivier catch deadlineScope');
                        console.log('Olivier typeof', err.constructor.name);
                        if (err instanceof ActivityFailure) {
                            console.log('Olivier deadlineScope ActivityFailure');
                            ctx._generated.__deadlineScopeExpired = true;
                            nextActivity = StateMachineActivities.EndEvent2;
                        }
                    });

                    // TODO: Sub flow timer 1
                    const timer1 = Timer1(ctx).then(async (result) => {
                        executeChild(Timer1Child, { args: [ctx], parentClosePolicy: ParentClosePolicy.ABANDON, });
                    });

                    // TODO: Sub flow timer 2
                    const timer2 = Timer2(ctx).then(async (result) => {
                        executeChild(Timer2Child, { args: [ctx], parentClosePolicy: ParentClosePolicy.ABANDON, });
                    });

                    // TODO: resolve promises.
                    await Promise.all([timer1, timer2, deadlineScopePromise]);


                }).catch((err) => {
                    console.log('Olivier timedActivityScope catch');
                    if (err instanceof ActivityFailure) {
                        console.log('Olivier timedActivityScope ActivityFailure');
                    }
                });




                //todo:
                // soort circulaire scope
                // 1. timed activity met 3 timers. wanneer timed activity klaar is, moeten de timers ook stoppen.
                // 2. wanneer de deadline timer klaar is, moet de timed activity ook stoppen.
                // Scope met 4 calls waarbij deze gestopt wordt wanneer de timed activity klaar is.
                // Een inner scope met 2 calls. De timed activity + deadline.


                console.log('Olivier __deadlineScopeExpired', ctx._generated.__deadlineScopeExpired)
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
    return 1000;
}
async function __DetermineDeadlineTimer2(ctx: WorkflowContext) {
    // DeadlineDuration script 2
    return 3000;
}
async function __DetermineDeadlineTimer3(ctx: WorkflowContext) {
    // DeadlineDuration script 3
    return 5000;
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated,
    };
}
