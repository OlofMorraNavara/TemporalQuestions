import {proxyActivities, sleep, workflowInfo} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import type * as activities from "../activities";

const { ThrowGlobalSignal} = proxyActivities<
    typeof activities
>({
    startToCloseTimeout: "1 minute",
    retry: {
        maximumAttempts: 3,
    },
});

export async function GlobalSignalThrower(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        _generated: {} as Record<string, any>,
        ...input,
    };

    await sleep(3000);

    // TODO throw global.
    await ThrowGlobalSignal(ctx);

    return ctx;
}
