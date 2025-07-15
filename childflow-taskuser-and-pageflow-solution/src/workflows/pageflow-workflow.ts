import {
	proxyActivities,
	defineSignal,
	setHandler,
	condition, uuid4,
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

const { completeTask, startForm, startTask } = proxyActivities<typeof formsApiHelpers>({
	startToCloseTimeout: '1 minute',
	retry: {
		maximumAttempts: 3,
	},
});

export async function PageFlowWorkflow(input: WorkflowInput): Promise<WorkflowContext> {
	let ctx: WorkflowContext = {
		...input,
	};

	// Start task
	const taskId = 'task-TaskUser4-' + uuid4()
	await startTask({
		workflowId: '',
		signalName: 'TaskUser4',
		taskId: taskId,
	});

	// TODO ScheduleScript

	let formData: any;

	while(true){
		ctx = await StartEvent(ctx);

		// Wait for form open signal
		let taskOpenedReceived = false;
		setHandler(defineSignal("taskOpenedSignal"), () => {
			taskOpenedReceived = true;
		});
		await condition(() => taskOpenedReceived);

		// Send HTTP request to the forms app to start form.
		await startForm(
			'ParentWorkflowID',
			{
				taskId: taskId,
				childWorkflowId: 'string',
				signalName: 'TaskUser1Done',
				formUri: 'string',
				tibcoWorkflowId: 'string',
				data: {
					input: 'test'
				}
			});
		let TaskUser1DoneReceived = false;
		setHandler(defineSignal<any>("TaskUser1Done"), (data: any) => {
			formData = data;
			TaskUser1DoneReceived = true;
		});
		let TaskUser1CancelReceived = false;
		setHandler(defineSignal("TaskUser1Cancel"), () => {
			TaskUser1CancelReceived = true;
		});
		let TaskUser1CloseReceived = false;
		setHandler(defineSignal("TaskUser1Close"), () => {
			TaskUser1CloseReceived = true;
		});
		await condition(() => TaskUser1DoneReceived || TaskUser1CancelReceived || TaskUser1CloseReceived);

		if(TaskUser1CancelReceived || TaskUser1CloseReceived) {
			continue;
		}

		// TODO Optional: Execute activities

		await startForm(
			'ParentWorkflowID',
			{
				taskId: taskId,
				childWorkflowId: 'string',
				signalName: 'TaskUser2Done',
				formUri: 'string',
				tibcoWorkflowId: 'string',
				data: {
					input: 'test'
				}
			});
		let TaskUser2DoneReceived = false;
		setHandler(defineSignal<any>("TaskUser2Done"), (data: any) => {
			formData = data;
			TaskUser2DoneReceived = true;
		});
		let TaskUser2CancelReceived = false;
		setHandler(defineSignal("TaskUser2Cancel"), () => {
			TaskUser2CancelReceived = true;
		});
		let TaskUser2CloseReceived = false;
		setHandler(defineSignal("TaskUser2Close"), () => {
			TaskUser2CloseReceived = true;
		});
		await condition(() => TaskUser2DoneReceived || TaskUser2CancelReceived || TaskUser2CloseReceived);

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


