import { log } from '@temporalio/activity';
import { createActivity } from '../create';
import { WorkflowContext } from '../../types/context';

export const TaskUser3 = createActivity({
	initiated: async (ctx: WorkflowContext) => {
		log.info(`Running initial script for: TaskUserPageflow3`);
		return ctx;
	},
	completed: async (ctx: WorkflowContext) => {
		log.info(`Running completed script for: TaskUserPageflow3`);
		return ctx;
	},
	run: async (ctx: WorkflowContext) => {
		ctx._generated.TaskUserPageflow3 = true;
		return ctx;
	},
});
