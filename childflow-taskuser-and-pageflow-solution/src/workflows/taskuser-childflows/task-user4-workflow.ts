import {
	proxyActivities,
	defineSignal,
	setHandler,
	condition, uuid4, workflowInfo, getExternalWorkflowHandle,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../../types/taskuser4-context';
import type * as activities from '../../activities';
import * as formsApiHelpers from "../../utils/forms-api-helper";
import {updateFormData} from "../../utils/forms-api-helper";

const { TaskUser4 } = proxyActivities<typeof activities>({
	startToCloseTimeout: '1 minute',
	retry: {
		maximumAttempts: 3,
	},
});

const { completeTask, startForm, startTask } = proxyActivities<typeof formsApiHelpers>({
	startToCloseTimeout: '1 minute',
	retry: {
		maximumAttempts: 3,
	},
});

export async function TaskUser4Workflow(input: WorkflowInput): Promise<WorkflowContext> {
	let ctx: WorkflowContext = {
		...input,
	};

	// Start task
	const workflowId = workflowInfo().workflowId;

	// Wait for form open signal
	let taskOpenedReceived = false;
	setHandler(defineSignal("TaskUser4TaskOpened"), () => {
		taskOpenedReceived = true;
	});
	await condition(() => taskOpenedReceived);

	// send HTTP request to the forms app to start form.
	await startForm(
		workflowId,
		{
			taskId: ctx._generated.taskIdTaskUser4,
			signalNameBase: `TaskUser4` , // ACTIVITY_NAME = 'TaskUser4' + SIGNAL = 'Close/Submit/Cancel/Open'
			formUri: 'string',
			tibcoWorkflowId: 'string',
			data: {
				input: 'test'
			},
		});

	// Wait for open signal from the forms app. Execute open Script.
	let TaskUser4OpenReceived = false;
	setHandler(defineSignal<any>("TaskUser4Open"), async (data: any) => {
		// TODO Execute open script
		await updateFormData(workflowId, {data}) // TODO pass the form data from the context using associated parameter mappings.
		TaskUser4OpenReceived = true;
	});

	await condition(() => TaskUser4OpenReceived);

	// TODO Send updated data after openScript to the forms app. openForm()

	// Wait for forms app to send signal when form is submitted/closed/cancelled.
	let TaskUser4SubmittedReceived = false;
	setHandler(defineSignal<any>("TaskUser4Submit"), (data: any) => {
		// TODO SubmitScript
		// TODO map data to workflow context.
		TaskUser4SubmittedReceived = true;
	});

	// TODO Should this be deleted and implemented on parent workflow level?? Send signals straight to parent workflow?
	let TaskUser4CloseReceived = false;
	setHandler(defineSignal<any>("TaskUser4Close"), async (data: any) => {
		// TODO CloseScript
		TaskUser4CloseReceived = true;
		await updateFormData(workflowId, {data}) // TODO pass the form data from the context using associated parameter mappings.
	});

	// TODO Should this be deleted and implemented on parent workflow level?? Send signals straight to parent workflow?
	let TaskUser4CancelReceived = false;
	setHandler(defineSignal<any>("TaskUser4Cancel"), (data: any) => {
		TaskUser4CancelReceived = true;
	});

	await condition(() => TaskUser4SubmittedReceived || TaskUser4CloseReceived || TaskUser4CancelReceived);

	if(TaskUser4SubmittedReceived) {
		// Get parent workflow handle to send signal to return workflow output.
		const parentHandle = getExternalWorkflowHandle(workflowInfo().parent.workflowId);
		await parentHandle.signal(defineSignal<[WorkflowOutput]>("TaskUser4Submit"), mapContextToOutput(ctx))
	}
	else{
		// TODO What to do when task is closed?
	}

	return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowContext {
	return {
		_generated: ctx._generated,
	};
}


