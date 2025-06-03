import { WorkflowContext } from '../types/context';
import { DateTimeUtil } from '../utils';
import { TibcoDuration } from '../types/tibco/types';

export async function determineTimerDurationdeadlineTimer(ctx: WorkflowContext): Promise<TibcoDuration> {
    return DateTimeUtil.createDuration(5000);
}