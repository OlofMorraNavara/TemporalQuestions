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

const { StartEvent,  EndEvent } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

export async function MainFlowTaskUserPageFlow(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        ...input,
    };
    ctx = await StartEvent(ctx);

    ctx._generated.prePageflowCall = true;

    ctx = await executeChild(PageFlowWorkflow, {
        args: [ctx],
        workflowId: "child-workflow-PageFlow-" + uuid4(),
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


