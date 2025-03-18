import {
    getExternalWorkflowHandle, setHandler, workflowInfo
} from '@temporalio/workflow';
import { WorkflowContext, WorkflowInput, WorkflowOutput } from '../types/context';
import * as signals from '../signals';

//TODO: 'Local' thrower:
export async function yourWorkflowThatSignals(ctx: WorkflowContext) {
    const handle = getExternalWorkflowHandle(workflowInfo().parent.workflowId);
    await handle.signal(signals.cancelSignal);
}

export async function GlobalSignalCatcherCancellation(input: WorkflowInput): Promise<WorkflowOutput> {
    let ctx: WorkflowContext = {
        _generated: {} as Record<string, any>,
        ...input,
    };

    // TODO: Global handler
    setHandler(signals.globalCancelSignal, () => {
        waitingForGlobalSignal = false;
    });

    // TODO: Bad polling mechanism.
    let waitingForGlobalSignal = true;
    while (waitingForGlobalSignal) {
        //await new Promise( resolve => setTimeout(resolve, 1000) );  TODO: Bad poll checks every second. Can this be done differently/ more efficient?

        // TODO: Temp for testing purpose. Takes X seconds to receive global cancellation signal.
        await new Promise( resolve => {
            setTimeout(resolve, 6000)
            waitingForGlobalSignal = false;
        });
    }

    // TODO throw local.
    await yourWorkflowThatSignals(ctx)

    return ctx;
}
