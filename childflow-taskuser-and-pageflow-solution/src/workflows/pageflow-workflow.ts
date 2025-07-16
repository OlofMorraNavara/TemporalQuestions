import {
	proxyActivities,
	defineSignal,
	setHandler,
	condition,
	workflowInfo,
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

export async function PageFlowWorkflow(input: WorkflowContext): Promise<WorkflowOutput> {
	let ctx: WorkflowContext;
	ctx = {
		...input
	};

	const workflowId = workflowInfo().workflowId;

	// Optional execute activity
	ctx = await StartEvent(ctx);

	// Send HTTP request to the forms app to start form.
	await startForm(
		workflowId,
		{
			taskId: ctx._generated.taskId,
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

	await updateFormData(workflowId, {}) // TODO pass the form data from the context using associated parameter mappings.

	let TaskUser1SubmitReceived = false;
	setHandler(defineSignal<any>("TaskUser1Submit"), (data: any) => {
		// TODO submitScript, or execute in parent?
		// TODO associated parameter mapping to context
		TaskUser1SubmitReceived = true;
	});
	await condition(() => TaskUser1SubmitReceived);

	// TODO Optional: Execute activities

	await startForm(
		workflowId,
		{
			taskId: ctx._generated.taskId,
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
	await updateFormData(workflowId, {}) // TODO pass the form data from the context using associated parameter mappings.

	let TaskUser2SubmitReceived = false;
	setHandler(defineSignal<any>("TaskUser2Submit"), (data: any) => {
		// TODO submitScript, or execute in parent?
		// TODO associated parameter mapping to context
		TaskUser2SubmitReceived = true;
	});

	await condition(() => TaskUser2SubmitReceived);

	// TODO Optional: Execute activities

	// Go to example
	ctx = await startFrom_GoToExample(ctx)

	ctx = await EndEvent(ctx);

	// Return mapped context back to parent.
	return mapContextToOutput(ctx);
}

async function startFrom_GoToExample(input: WorkflowContext): Promise<WorkflowContext> {
	let ctx: WorkflowContext = {
		...input
	};

	const workflowId = workflowInfo().workflowId;

	// TODO Optional: Execute activities

	await startForm(
		workflowId,
		{
			taskId: ctx._generated.taskId,
			signalNameBase: 'TaskUser3', // ACTIVITY_NAME = 'TaskUser3' + SIGNAL = 'Close/Submit/Cancel/Open'
			formUri: 'string',
			tibcoWorkflowId: 'string',
			data: {
				input: 'test'
			}
		});

	// Wait for open signal from the forms app. Execute open Script.
	let TaskUser3OpenReceived = false;
	setHandler(defineSignal<any>("TaskUser3Open"), (data: any) => {
		// TODO Execute open script
		TaskUser3OpenReceived = true;
	});

	await condition(() => TaskUser3OpenReceived);

	// Send updated data after openScript to the forms app.
	await updateFormData(workflowId, {}) // TODO pass the form data from the context using associated parameter mappings.

	let TaskUser3SubmitReceived = false;
	setHandler(defineSignal<any>("TaskUser3Submit"), (data: any) => {
		// TODO submitScript, or execute in parent?
		// TODO associated parameter mapping to context
		TaskUser3SubmitReceived = true;
	});

	await condition(() => TaskUser3SubmitReceived);

	return ctx;
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowContext {
	return {
		_generated: ctx._generated,
	};
}


