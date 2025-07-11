import {CustomParam} from "./CustomParam";

export type SubWorkflowInput = {
    param1: string;
    param2?: string;
    param3?: CustomParam;
};

export type SubWorkflowOutput = {
    _generated: Record<string, any>;
     param1: string;
     param2?: string
};

export type SubWorkflowContext = {
    _generated: Record<string, any>;
    param1: string;
    param2?: string;
};
