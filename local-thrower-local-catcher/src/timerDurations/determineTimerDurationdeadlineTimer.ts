import { WorkflowContext } from '../types/context';
import { TibcoDuration } from '../types/tibco/TibcoDuration';
import { DateTimeUtil } from '../utils';

export async function determineTimerDurationdeadlineTimer(ctx: WorkflowContext): Promise<TibcoDuration> {
    return DateTimeUtil.createDuration(5000);
}
