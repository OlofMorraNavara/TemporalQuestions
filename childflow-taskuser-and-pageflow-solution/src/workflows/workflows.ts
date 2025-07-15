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
    executeChild, workflowInfo,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from '../activities';

import {PageFlowWorkflow} from "./index";
import {TaskUser4Workflow} from "./taskuser-childflows/task-user4-workflow";
import * as formsApiHelpers from "../utils/forms-api-helper";

import type * as PageFlowWorkflowDefinitions from "../types/pageflow-context";
import type * as TaskUser4Definitions from "../types/taskuser4-context";

const { StartEvent,  EndEvent } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});

const { completeTask, startForm, startTask, updateFormData } = proxyActivities<typeof formsApiHelpers>({
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

    // TODO ============ Normal task user activity ============
    ctx._generated.taskIdTaskUser4 = 'task-TaskUser4-' + uuid4()
    const inputTaskUser4 = {
        // TODO mapping from associated parameter data to input. For now ctx and taskId;
        ...ctx,
        taskId: ctx._generated.taskIdTaskUser4
    }

    // TODO Task user initiated script?
    // TODO ScheduleScript

    await startTask({
        workflowId: workflowInfo().workflowId,
        signalNameBase: 'TaskUser4', // ACTIVITY_NAME = 'TaskUser4' + SIGNAL = 'TaskOpened'
        taskId: ctx._generated.taskIdTaskUser4,
    });

    while(true){
        const cancellationScopeTaskUser4_TaskUser4 = new CancellationScope();
        cancellationScopeTaskUser4_TaskUser4.run(async () => {
            await executeChild(TaskUser4Workflow, {
                args: [inputTaskUser4], // TODO input could maybe also be workflow context?
                workflowId: "child-workflow-taskUser-" + uuid4(),
                cancellationType: ChildWorkflowCancellationType.TRY_CANCEL,
                parentClosePolicy: ParentClosePolicy.TERMINATE
            });
        }).catch((err: any) => {
            if (!isCancellation(err)) {
                throw err;
            }
        });

        let TaskUser4SubmitReceived = false;
        setHandler(defineSignal<[TaskUser4Definitions.WorkflowOutput]>("TaskUser4Submit"), async (data: TaskUser4Definitions.WorkflowOutput) => {
            // Data mapping using the associated parameters
            ctx.Param1 = data.taskUser4TestParam;

            TaskUser4SubmitReceived = true;
        });

        let TaskUser4CloseReceived = false;
        setHandler(defineSignal("TaskUser4Close"), async () => {
            TaskUser4CloseReceived = true;
        });

        let TaskUser4CancelReceived = false;
        setHandler(defineSignal("TaskUser4Cancel"), async () => {
            await completeTask(ctx._generated.taskIdTaskUser4);
            TaskUser4CancelReceived = true;
        });

        await condition(() => TaskUser4SubmitReceived  || TaskUser4CloseReceived || TaskUser4CancelReceived);

        if(TaskUser4CloseReceived) {
            // TODO What to do when task is closed?
            //  Where does the data come from and go?
            //  Does it come straight from the forms API or from the child workflow?
            //  Do we map the data to this workflow context?
        }
        else{ // If task is cancelled or submit received, we can stop the loop.
            await completeTask(ctx._generated.taskIdTaskUser4);

            // TODO Task user completed script?

            break; // Stop looping if submit received
        }
    }




    // TODO ============ Page flow task user activity ============
    ctx._generated.taskIdPageFlowWorkflow = 'task-pageFlow-' + uuid4()
    const inputPageFlowWorkflow = {
        // TODO mapping from associated parameter data to input. For now ctx and taskId;
        ...ctx,
        taskId: ctx._generated.taskIdPageFlowWorkflow
    }

    // TODO Page flow activity initiated script?
    // TODO ScheduleScript

    await startTask({
        workflowId: workflowInfo().workflowId,
        signalNameBase: 'PageFlowWorkflow', // PAGEFLOW_NAME = 'PageFlowWorkflow' + SIGNAL = 'TaskOpened'
        taskId: ctx._generated.taskIdPageFlowWorkflow,
    });

    // Loop for restarting flow
    while(true){
        const cancellationScopePageFlowWorkflow_PageFlowWorkflow = new CancellationScope();
        cancellationScopePageFlowWorkflow_PageFlowWorkflow.run(async () => {
            await executeChild(PageFlowWorkflow, {
                args: [inputPageFlowWorkflow],
                workflowId: "PageFlowWorkflow-" + uuid4(),
                cancellationType: ChildWorkflowCancellationType.TRY_CANCEL,
                parentClosePolicy: ParentClosePolicy.TERMINATE
            });
        }).catch((err: any) => {
            if (!isCancellation(err)) {
                throw err;
            }
        });

        let PageFlowWorkflowSubmitReceived = false;
        setHandler(defineSignal<[PageFlowWorkflowDefinitions.WorkflowOutput]>("PageFlowWorkflowSubmit"), async (data: PageFlowWorkflowDefinitions.WorkflowOutput) => {
            await completeTask(ctx._generated.taskIdPageFlowWorkflow)

            // Data mapping using the associated parameters
            ctx.Param2 = data.pageFlowWorkflowTestParam;

            // TODO Page flow activity complete script?

            PageFlowWorkflowSubmitReceived = true;
        });

        let PageFlowWorkflowCloseReceived = false;
        setHandler(defineSignal("PageFlowWorkflowClose"), async () => {
            PageFlowWorkflowCloseReceived = true;
        });

        let PageFlowWorkflowCancelReceived = false;
        setHandler(defineSignal("PageFlowWorkflowCancel"), async () => {
            PageFlowWorkflowCancelReceived = true;
        });

        await condition(() => PageFlowWorkflowCloseReceived || PageFlowWorkflowCancelReceived || PageFlowWorkflowSubmitReceived);

        if(PageFlowWorkflowCloseReceived || PageFlowWorkflowCancelReceived) {
            cancellationScopePageFlowWorkflow_PageFlowWorkflow.cancel()
        }
        else{
            break; // Stop looping if submit received
        }
    }


    ctx = await EndEvent(ctx);

    return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowOutput {
    return {
        _generated: ctx._generated,
    };
}


