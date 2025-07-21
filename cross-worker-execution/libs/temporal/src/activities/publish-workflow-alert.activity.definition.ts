import { type ActivitiesOf, defineActivity } from '../definitions';

export const publishWorkflowAlertActivity = defineActivity('publishWorkflowAlert')<
    { alertName: string; payload: Record<string, any> },
    void
>();

export type PublishWorkflowAlertActivities = ActivitiesOf<{
    publishWorkflowAlert: typeof publishWorkflowAlertActivity;
}>;
