import { WorkflowHandleWithFirstExecutionRunId } from '@temporalio/client';

export type Location = LocationTemporal | LocationTibco;

export interface LocationTemporal {
    type: 'TEMPORAL';
    workflowId: string;
    taskQueue: string;
    name: string;
}

export interface LocationTibco {
    type: 'TIBCO';
    processName: string;
    operation: string;
    version: string;
}

export type WorkflowInput<ISubflow> = {
    runtimeIdentifier: string;
    timeout: number;
    subflowInput: ISubflow;
};

export type WorkflowOutput<OSubflow> = {
    subflowOutput: OSubflow;
};

export type WorkflowContext<ISubflow, OSubflow> = {
    // Input
    runtimeIdentifier: string;
    timeout: number;
    subflowInput: ISubflow;

    conductorUrl: string;
    mainFlowDone: boolean;
    location?: Location;

    temporalClient?: WorkflowHandleWithFirstExecutionRunId<(input: ISubflow) => Promise<any>>;
};
