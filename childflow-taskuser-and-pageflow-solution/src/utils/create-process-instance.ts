import { log, sleep } from '@temporalio/activity';

export class CreateProcessInstance {
    public static async createProcessInstance(
        moduleName: string,
        processName: string,
        operationName: string,
        input: Record<string, string>,
        options?: {
            /** Priority of the task - should be set to a default value like 100 unless we have a use for this at some point. */
            priority?: number;
        }
    ): Promise<any> {
        log.info(`Creating process instance: ${moduleName}.${processName}.${operationName}`);
        await sleep(2 * 1000);
        return Promise.resolve({
            moduleName,
            processName,
            operationName,
            input,
            options,
        });
    }
}
