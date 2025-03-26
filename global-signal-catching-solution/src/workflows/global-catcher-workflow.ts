import { getExternalWorkflowHandle, setHandler, workflowInfo } from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import * as signals from '../signals';
import {GlobalSignalInput} from "../signals/signal-data/GlobalSignalInput";

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

    // TODO: Global signal handler
    let globalSignalInput: GlobalSignalInput;
    setHandler(signals.globalSignal, (input: GlobalSignalInput) => {
        waitingForGlobalSignal = false;
        globalSignalInput = input;
    });

    // TODO: Bad polling mechanism.
    let waitingForGlobalSignal = true;
    while (waitingForGlobalSignal) {
        await new Promise( resolve => setTimeout(resolve, 1000));
    }

    // TODO throw local.
    await throwLocalSignal(globalSignalInput);

    return ctx;
}
