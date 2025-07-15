import { log } from '@temporalio/activity';
import { createActivity } from '../create';
import { WorkflowContext } from '../../types/context';
import {uuid4} from "@temporalio/workflow";
import {startTask} from "../../utils/forms-api-helper";

export const TaskUser4 = createActivity({
	initiated: async (ctx: WorkflowContext) => {
		log.info(`Running initial script for: TaskUser4`);
		return ctx;
	},
	completed: async (ctx: WorkflowContext) => {
		log.info(`Running completed script for: TaskUser4`);
		return ctx;
	},
	run: async (ctx: WorkflowContext) => {
		ctx._generated.TaskUser4 = true;
		// const taskId = 'task-TaskUser4-' + uuid4()
		// await startTask({
		// 	workflowId: '',
		// 	signalName: 'TaskUser4',
		// 	taskId: taskId,
		// });


		return ctx;
	},
});
