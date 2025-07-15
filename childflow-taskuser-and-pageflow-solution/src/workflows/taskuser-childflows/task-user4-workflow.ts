import {
	proxyActivities,
	defineSignal,
	setHandler,
	condition, uuid4,
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

	// Start task
	const taskId = 'task-TaskUser4-' + uuid4()
	await startTask({
		workflowId: '',
		signalName: 'TaskUser4',
		taskId: taskId,
	});

	// TODO ScheduleScript

	let formData: any;

	while (true){
		// Wait for form open signal
		let taskOpenedReceived = false;
		setHandler(defineSignal("taskOpenedSignal"), () => {
			taskOpenedReceived = true;
		});
		await condition(() => taskOpenedReceived);

		// TODO OpenScript

		// send HTTP request to the forms app to start form.
		await startForm(
			'ParentWorkflowID',
			{
				taskId: 'taskId',
				childWorkflowId: 'string',
				signalName: 'string',
				formUri: 'string',
				tibcoWorkflowId: 'string',
				data: {
					input: 'test'
				},
			});

		// Wait for forms app to send signal when form is submitted/closed/cancelled.
		let TaskUser4SubmittedReceived = false;
		setHandler(defineSignal<any>("TaskUser4Submitted"), (data: any) => {
			formData = data;
			// TODO SubmitScript
			TaskUser4SubmittedReceived = true;
		});
		let TaskUser4CloseReceived = false;
		setHandler(defineSignal<any>("TaskUser4Close"), (data: any) => {
			formData = data;
			// TODO CloseScript
			TaskUser4CloseReceived = true;
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
	await completeTask('taskId');

	ctx._generated.formDataTaskUser4 = formData;

	// TODO Task user completed script? Or execute this script in the parent workflow?

	return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowContext {
	return {
		_generated: ctx._generated,
	};
}


