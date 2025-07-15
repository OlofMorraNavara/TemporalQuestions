import {
	proxyActivities,
	defineSignal,
	setHandler,
	condition, uuid4, workflowInfo,
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../../types/context';
import type * as activities from '../../activities';
import * as formsApiHelpers from "../../utils/forms-api-helper";

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

	// TODO Task user initiated script? Or execute this script in the parent workflow?

	// TODO ScheduleScript

	// Start task
	const workflowId = workflowInfo().workflowId;
	const taskId = 'task-TaskUser4-' + uuid4()
	await startTask({
		workflowId: workflowId,
		signalNameBase: 'TaskUser4', // ACTIVITY_NAME = 'TaskUser4' + SIGNAL = 'TaskOpened'
		taskId: taskId,
	});

	let formData: any;

	while (true){
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
				taskId: taskId,
				signalNameBase: `TaskUser4` , // ACTIVITY_NAME = 'TaskUser4' + SIGNAL = 'Close/Submit/Cancel/Open'
				formUri: 'string',
				tibcoWorkflowId: 'string',
				data: {
					input: 'test'
				},
			});

		// Wait for open signal from the forms app. Execute open Script.
		let TaskUser4OpenReceived = false;
		setHandler(defineSignal<any>("TaskUser4Open"), (data: any) => {
			// TODO Execute open script
			TaskUser4OpenReceived = true;
		});

		await condition(() => TaskUser4OpenReceived);

		// TODO Send updated data after openScript to the forms app. openForm()

		// Wait for forms app to send signal when form is submitted/closed/cancelled.
		let TaskUser4SubmittedReceived = false;
		setHandler(defineSignal<any>("TaskUser4Submit"), (data: any) => {
			formData = data;
			// TODO SubmitScript
			TaskUser4SubmittedReceived = true;
		});
		let TaskUser4CloseReceived = false;
		setHandler(defineSignal<any>("TaskUser4Close"), (data: any) => {
			formData = data;
			// TODO CloseScript
			TaskUser4CloseReceived = true;
			// TODO Send updated data after closeScript to the forms app. closeForm()
		});
		let TaskUser4CancelReceived = false;
		setHandler(defineSignal<any>("TaskUser4Cancel"), (data: any) => {
			formData = data;
			TaskUser4CancelReceived = true;
		});

		await condition(() => TaskUser4SubmittedReceived || TaskUser4CloseReceived || TaskUser4CancelReceived);

		if(TaskUser4SubmittedReceived){
			break;
		}
	}

	// TODO data mapping? Or return result (signal or normale return) and do the mapping in the parent workflow?

	// Send task done to forms app.
	await completeTask(taskId);

	ctx._generated.formDataTaskUser4 = formData;

	// TODO Task user completed script? Or execute this script in the parent workflow?

	return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowContext {
	return {
		_generated: ctx._generated,
	};
}


