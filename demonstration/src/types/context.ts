export type WorkflowInput = {
    name: string;
}

export type WorkflowContext = {
    name: string;
    mayFail?: boolean;
}

export type WorkflowOutput = {
    name: string;
}