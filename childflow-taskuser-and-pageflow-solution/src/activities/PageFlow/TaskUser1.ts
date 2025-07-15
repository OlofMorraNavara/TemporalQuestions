import { log } from '@temporalio/activity';
import { createActivity } from '../create';
import { WorkflowContext } from '../../types/context';

export const TaskUser1 = createActivity({
	initiated: async (ctx: WorkflowContext) => {
		log.info(`Running initial script for: TaskUserPageflow1`);
		return ctx;
	},
	completed: async (ctx: WorkflowContext) => {
		log.info(`Running completed script for: TaskUserPageflow1`);
		return ctx;
	},
	run: async (ctx: WorkflowContext) => {
		ctx._generated.TaskUserPageflow1 = true;
		return ctx;
	},
});
