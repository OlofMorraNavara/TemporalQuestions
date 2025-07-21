import { setHandler, defineSignal, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { Location, WorkflowContext, WorkflowInput, WorkflowOutput } from '../context';

function stopChildWorkflowHandler<ISubflow, OSubflow>(state: WorkflowContext<ISubflow, OSubflow>) {
    setHandler(defineSignal('mainFlowDoneSignal'), () => {
        state.mainFlowDone = true;
    });
}

const { runTemporal, getLocation, getResultsTemporal } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 1,
    },
});

// export const subflowConductorCallerWorkflow = createWorkflow<
//     WorkflowInput<ISubflow>,
//     WorkflowOutput<OSubflow>,
//     WorkflowContext<ISubflow, OSubflow>
// >(
//     SubflowConductorCallerProcessDefinition,
//     subflowConductorCaller
// );

export async function subflowConductorCaller<ISubflow, OSubflow>(
    input: WorkflowInput<ISubflow>
): Promise<WorkflowOutput<OSubflow>> {
    let ctx: WorkflowContext<ISubflow, OSubflow> = {
        ...input,
        mainFlowDone: false,
        conductorUrl: 'localhost:8080',
    };

    // Setup 'mainFlowDoneSignal' to handle the end of the main flow
    stopChildWorkflowHandler<ISubflow, OSubflow>(ctx);

    // Get the location from where to start the subflow
    ctx.location = await getLocation({
        runtimeIdentifier: ctx.runtimeIdentifier,
        conductorUrl: ctx.conductorUrl,
    });

    let result: OSubflow;
    if (ctx.location.type === 'TIBCO') {
        // return await handleTibco<TInput, TOutput>(state);
    } else if (ctx.location.type === 'TEMPORAL') {
        // Start the Temporal workflow
        const id = await runTemporal({
            location: ctx.location,
            input: ctx.subflowInput,
        });
        result = (await getResultsTemporal({ workflowId: id })) as OSubflow;
    }

    return {
        subflowOutput: result,
    } as WorkflowOutput<OSubflow>;
}
