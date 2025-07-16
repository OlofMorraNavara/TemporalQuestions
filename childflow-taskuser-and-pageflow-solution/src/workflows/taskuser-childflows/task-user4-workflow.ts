import {
	proxyActivities,
	defineSignal,
	setHandler,
	condition, workflowInfo,
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

export async function TaskUser4Workflow(input: WorkflowInput): Promise<WorkflowOutput> {
	let ctx: WorkflowContext = {
		...input,
	};

	const workflowId = workflowInfo().workflowId;

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

	// Wait for forms app to send signal when form is submitted.
	let TaskUser4SubmittedReceived = false;
	setHandler(defineSignal<any>("TaskUser4Submit"), (data: any) => {
		// TODO SubmitScript, or execute this in parent?
		// TODO map data to workflow context.
		TaskUser4SubmittedReceived = true;
	});

	await condition(() => TaskUser4SubmittedReceived);

	return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowContext {
	return {
		_generated: ctx._generated,
	};
}


