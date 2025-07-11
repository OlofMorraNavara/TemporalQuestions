import {
	proxyActivities,
} from '@temporalio/workflow';
import {SubWorkflowOutput, SubWorkflowInput, SubWorkflowContext} from '../types/context-subflow';
import type * as activities from '../activities';

const { StartEvent, TestActivity,  EndEvent } = proxyActivities<typeof activities>({
	startToCloseTimeout: '1 minute',
	retry: {
		maximumAttempts: 3,
	},
});

export async function SubflowWorkflow(input: SubWorkflowInput): Promise<SubWorkflowOutput> {
	let ctx: SubWorkflowContext = {
		_generated :{},
		...input,
	};

	ctx = await StartEvent(ctx);

	ctx.param1 = ctx.param1 + ' SubflowWorkflow param1';
	ctx.param2 = ctx.param2 + ' SubflowWorkflow param2';

	ctx = await TestActivity(ctx);

	ctx = await EndEvent(ctx);

	return mapContextToOutput(ctx);
}

function mapContextToOutput(ctx: SubWorkflowContext): SubWorkflowOutput {
	return {
		_generated: ctx._generated,
		param1: ctx.param1,
		param2: ctx.param2,
	};
}


