import { WorkflowContext } from '../types/context';
import { TibcoDuration } from '../types/tibco/types';

async function determineTimerLengthTemp(ms: number) {
    const duration = new TibcoDuration(0, 0, 0, 0, 0, ms);
    return duration;
}

export async function determineTimerDuration(ctx: WorkflowContext) {
    return determineTimerLengthTemp(15);
}

export async function determineRescheduleTimerDuration(ctx: WorkflowContext) {
  return determineTimerLengthTemp(15);
}
