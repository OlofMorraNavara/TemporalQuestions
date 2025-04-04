import {getExternalWorkflowHandle, proxyActivities, setHandler, workflowInfo, condition} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import * as signals from '../signals';
import { GlobalSignalInput } from '../signals/signal-data/GlobalSignalInput';
import type * as activities from "../activities";

const { RegisterGlobalSignalCatcher} = proxyActivities<
    typeof activities
>({
    startToCloseTimeout: "1 minute",
    retry: {
        maximumAttempts: 3,
    },
});

//TODO: 'Local' thrower:
export async function throwLocalSignal(globalSignalInput?: GlobalSignalInput) {
    const handle = getExternalWorkflowHandle(workflowInfo().parent.workflowId);
    await handle.signal(signals.localSignal, globalSignalInput);
}

export async function GlobalSignalCatcher(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        _generated: {} as Record<string, any>,
        ...input,
    };

    await RegisterGlobalSignalCatcher(ctx);

    let globalSignalReceived = false;

    // TODO: Global signal handler
    let globalSignalInput: GlobalSignalInput;
    setHandler(signals.globalSignal, (input: GlobalSignalInput) => {
        globalSignalReceived = true;
        globalSignalInput = input;
    });

    // TODO: Temporal polling mechanism.
    await condition(() => globalSignalReceived)

    // TODO throw local.
    await throwLocalSignal(globalSignalInput);

    return ctx;
}
