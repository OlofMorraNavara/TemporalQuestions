import { Context } from '@temporalio/activity';

/**
 * Implementation of interface https://docs.tibco.com/pub/amx-bpm/4.3.3/doc/html/Default.htm#Business-Data-Services-Developer-Guide/process-instance-attributes-and-methods.htm?TocPath=Business%2520Data%2520Services%2520Developer%2520Guide%257CProcess%2520Manager%2520and%2520Work%2520Manager%2520Scripting%257C_____1
 */
export class Process {
    public static getId(): string {
        return Context.current().info.workflowExecution.runId;
    }

    /**
     * In TIBCO, this method returns the name of the process template. In Temporal, this method returns the workflow type, which is not the same.
     * TODO: Verify it is only used for logging purposes and update (or do nothing) the code accordingly.
     */
    public static getName(): string {
        return Context.current().info.workflowType;
    }

    /**
     * In TIBCO this method is used to get the most local loop index. This is hard behaviour to understand, so our current goal
     * is to automatically alter the JavaScript code to use a for loop index instead of this method.
     */
    public static getActivityLoopIndex(): number {
        return Context.current().info.attempt;
    }
}
