import {getExternalWorkflowHandle, setHandler,condition,defineSignal, SignalDefinition } from '@temporalio/workflow';

function stopChildWorkflowHandler(state: { value: boolean }) {
    setHandler(defineSignal('mainFlowDoneSignal'), () => {
        state.value = true;
    });
}
function signalHandler(signal: SignalDefinition, state: { value: boolean }) {
    setHandler(signal, async () => {
        state.value = true;
    });
}
export async function localSignalOrchestrator(input: { signals: SignalDefinition[]; mainWorkflowId: string }): Promise<void> {
    // Initialize state for the main flow done signal and local signal
    let mainFlowDoneSignalReceived = { value: false };
    const mainParentProcessHandle = getExternalWorkflowHandle(input.mainWorkflowId);

    // Setup 'mainFlowDoneSignal' to handle the end of the main flow
    stopChildWorkflowHandler(mainFlowDoneSignalReceived);

    const booleanStates = []

    // Setup handlers and state for each local signal
    for (let i = 0; i < input.signals.length; i++) {
        const state = { value: false };
        booleanStates[i] = state
        signalHandler(input.signals[i], state);
    }

    while (!mainFlowDoneSignalReceived.value && input.signals.length > 0) {
        await condition(() => booleanStates.some(s => s.value) || mainFlowDoneSignalReceived.value);

        for (let i = 0; i < booleanStates.length; i++) {
            if (booleanStates[i].value) {
                await mainParentProcessHandle.signal(input.signals[i]);
                booleanStates[i].value = false;
            }
        }
    }
}

