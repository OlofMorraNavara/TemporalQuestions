/**
 * ⚠️ This needs to be a type import!
 *
 * This class is used in workflow code, where the original Node AsyncLocalStorage is not available and instead made
 * available through @temporalio/workflow. If this is not a type import, initialization of the worker will fail, because
 * AsyncLocalStorage will be undefined!
 */
import type { AsyncLocalStorage } from 'node:async_hooks';
import { type Context as ContextInterface } from './context.interface';

export class AgnosticContextManager<Context extends Record<string, any> = ContextInterface> {
    readonly storage: AsyncLocalStorage<Context>;

    constructor(storage: AsyncLocalStorage<Context>) {
        this.storage = storage;
    }

    /**
     * Run the provided function `fn` and record Workflow context in Temporal SDK calls, if provided.
     */
    withContext<Result>(fn: () => Result, context?: Context): NoInfer<Result> {
        if (!context) {
            return fn();
        }

        return this.storage.run(context, () => fn());
    }

    getContext(): Context | undefined {
        return this.storage.getStore();
    }

    disable(): void {
        this.storage.disable();
    }
}
