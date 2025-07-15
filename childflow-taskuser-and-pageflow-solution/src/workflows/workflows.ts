import {
    CancellationScope,
    isCancellation,
    proxyActivities,
    defineSignal,
    setHandler,
    condition,
    uuid4,
    ChildWorkflowCancellationType,
    ParentClosePolicy,
    executeChild,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';

import {PageFlowWorkflow} from "./index";
import {TaskUser4Workflow} from "./taskuser-childflows/task-user4-workflow";

const { StartEvent,  EndEvent } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

export async function MainflowTaskUserAndPageFlow(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input,
    };
    ctx = await StartEvent(ctx);

    // TODO example with signal and timer as well?

    // Normal task user activity.
    const resultTaskUser4Workflow = await executeChild(TaskUser4Workflow, {
        args: [ctx],
        workflowId: "child-workflow-taskUser-" + uuid4(),
        cancellationType: ChildWorkflowCancellationType.TRY_CANCEL,
        parentClosePolicy: ParentClosePolicy.TERMINATE
    });

    // Page flow task user activity.
    const resultPageFlowWorkflow = await executeChild(PageFlowWorkflow, {
        args: [ctx],
        workflowId: "PageFlowWorkflow-" + uuid4(),
        cancellationType: ChildWorkflowCancellationType.TRY_CANCEL,
        parentClosePolicy: ParentClosePolicy.TERMINATE
    });

    ctx = await EndEvent(ctx);

    return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated,
    };
}


