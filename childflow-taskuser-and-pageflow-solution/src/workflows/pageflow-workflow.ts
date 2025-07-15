import {
	proxyActivities,
	defineSignal,
	setHandler,
	condition, uuid4,
	WorkflowInfo, workflowInfo
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/pageflow-context';
import type * as activities from '../activities';
import * as formsApiHelpers from "../utils/forms-api-helper";

const {StartEvent, TaskUser1, TaskUser2, TaskUser3, EndEvent } = proxyActivities<typeof activities>({
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

export async function PageFlowWorkflow(input: WorkflowInput): Promise<WorkflowContext> {
	let ctx: WorkflowContext = {
		...input,
	};

	// TODO ScheduleScript

	// Start task
	const workflowId = workflowInfo().workflowId;
	const taskId = 'task-pageflow-' + uuid4()
	await startTask({
		workflowId: '',
		signalNameBase: 'pageFlowName', // PAGEFLOW_NAME = 'pageFlowName' + SIGNAL = 'TaskOpened'
		taskId: taskId,
	});

	let formData: any;
	while(true){
		ctx = await StartEvent(ctx);

		// Wait for form open signal
		let taskOpenedReceived = false;
		setHandler(defineSignal("pageFlowNameTaskOpened"), () => {
			taskOpenedReceived = true;
		});
		await condition(() => taskOpenedReceived);

		// Send HTTP request to the forms app to start form.
		await startForm(
			workflowId,
			{
				taskId: taskId,
				signalNameBase: 'TaskUser1', // ACTIVITY_NAME = 'TaskUser1' + SIGNAL = 'Close/Submit/Cancel/Open'
				formUri: 'string',
				tibcoWorkflowId: 'string',
				data: {
					input: 'test'
				}
			});

		// Wait for open signal from the forms app. Execute open Script.
		let TaskUser1OpenReceived = false;
		setHandler(defineSignal<any>("TaskUser1Open"), (data: any) => {
			// TODO Execute open script
			TaskUser1OpenReceived = true;
		});

		await condition(() => TaskUser1OpenReceived);

		// TODO Send updated data after openScript to the forms app. openForm()

		let TaskUser1SubmitReceived = false;
		setHandler(defineSignal<any>("TaskUser1Submit"), (data: any) => {
			formData = data;
			TaskUser1SubmitReceived = true;
		});
		let TaskUser1CancelReceived = false;
		setHandler(defineSignal("TaskUser1Cancel"), () => {
			TaskUser1CancelReceived = true;
		});
		let TaskUser1CloseReceived = false;
		setHandler(defineSignal("TaskUser1Close"), () => {
			TaskUser1CloseReceived = true;
		});
		await condition(() => TaskUser1SubmitReceived || TaskUser1CancelReceived || TaskUser1CloseReceived);

		if(TaskUser1CancelReceived || TaskUser1CloseReceived) {
			continue;
		}

		// TODO Optional: Execute activities

		await startForm(
			workflowId,
			{
				taskId: taskId,
				signalNameBase: 'TaskUser2', // ACTIVITY_NAME = 'TaskUser2' + SIGNAL = 'Close/Submit/Cancel/Open'
				formUri: 'string',
				tibcoWorkflowId: 'string',
				data: {
					input: 'test'
				}
			});

		// Wait for open signal from the forms app. Execute open Script.
		let TaskUser2OpenReceived = false;
		setHandler(defineSignal<any>("TaskUser2Open"), (data: any) => {
			// TODO Execute open script
			TaskUser2OpenReceived = true;
		});

		await condition(() => TaskUser2OpenReceived);

		// Send updated data after openScript to the forms app.
		await updateFormData(workflowId, formData)

		let TaskUser2SubmitReceived = false;
		setHandler(defineSignal<any>("TaskUser2Submit"), (data: any) => {
			formData = data;
			TaskUser2SubmitReceived = true;
		});
		let TaskUser2CancelReceived = false;
		setHandler(defineSignal("TaskUser2Cancel"), () => {
			TaskUser2CancelReceived = true;
		});
		let TaskUser2CloseReceived = false;
		setHandler(defineSignal("TaskUser2Close"), () => {
			TaskUser2CloseReceived = true;
		});
		await condition(() => TaskUser2SubmitReceived || TaskUser2CancelReceived || TaskUser2CloseReceived);

		if(TaskUser2CancelReceived || TaskUser2CloseReceived) {
			continue;
		}

		// TODO Optional: Execute activities

		ctx = await EndEvent(ctx);

		break;
	}

	// TODO data mapping? Or return result (signal or normale return) and do the mapping in the parent workflow?

	// Send task done to forms app.
	await completeTask(taskId);

	// TODO Task user completed script? Or execute this script in the parent workflow?

	return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowContext {
	return {
		_generated: ctx._generated,
	};
}


