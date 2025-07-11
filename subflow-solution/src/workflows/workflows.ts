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

import {SubflowWorkflow} from "./index";

const { StartEvent,  EndEvent } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

type RetrieveWorkflowInputType<T> = T extends (arg: infer U, ...args: any) => any ? U : never;

export async function MainWorkflow(input: WorkflowInput): Promise<WorkflowOutput> {
    // Set initial context values
    let ctx: WorkflowContext = {
        ...input,
        param1: "MainWorkflow param1",
        param2: "MainWorkflow param2",
    };

    ctx = await StartEvent(ctx);

    ctx._generated.preSubflowCall = true;

    // Generate the subflow input
    type SubWorkflowInputDeclaration = RetrieveWorkflowInputType<typeof SubflowWorkflow>;

    const subflowInput: SubWorkflowInputDeclaration = {
        param1: ctx.param1,
        param2: ctx.param2,
        param3: {
            name: '',
            value: ''
        }
    };

    const result = await executeChild(SubflowWorkflow, {
        args: [subflowInput],
        workflowId: "sub-workflow-" + uuid4(),
        cancellationType: ChildWorkflowCancellationType.TRY_CANCEL,
        parentClosePolicy: ParentClosePolicy.TERMINATE
    });

    console.log("Subflow result:", result);

    ctx.param1 = result.param1;
    ctx.param2 = result.param2;

    ctx = await EndEvent(ctx);

    return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated,
        param1: ctx.param1,
        param2: ctx.param2,
    };
}


