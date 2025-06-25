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

const { StartEvent, TestActivity,  EndEvent } = proxyActivities<typeof activities>({
	startToCloseTimeout: '1 minute',
	retry: {
		maximumAttempts: 3,
	},
});

export async function PageFlowWorkflow(input: WorkflowInput): Promise<WorkflowContext> {
	let ctx: WorkflowContext = {
		...input,
	};
	ctx = await StartEvent(ctx);

	ctx = await TestActivity(ctx);

	ctx = await EndEvent(ctx);

	return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: WorkflowContext): WorkflowContext {
	return {
		_generated: ctx._generated,
	};
}


