import * as libCoverage from 'istanbul-lib-coverage';
import type { InjectedSinks, WorkerOptions } from '@temporalio/worker';
import type { CoverageSinks } from './coverage-sinks';

const convertToJestCoverageFormat = (covData: libCoverage.CoverageMapData) => {
    const result: Record<string, unknown> = {};
    Object.entries(covData).forEach(([k, v]) => {
        if ('data' in v) {
            result[k] = v.toJSON();
        }
    });

    return result;
};

/**
 * Workflow coverage helper which enables code coverage collection for workflows.
 * This is based on the package https://github.com/temporalio/sdk-typescript/tree/main/packages/nyc-test-coverage.
 * The main difference is that this implementation modifies the Webpack configuration to use `ts-loader` instead of `swc-loader`
 * to be compatible with `ts-jest`. Additionally, it merges the coverage data into the global coverage using `istanbul-lib-coverage`.
 *
 * This class is used to augment the Worker bundle and runtime with coverage collection capabilities.
 * The collected coverage data can be used to merge into the global coverage (jest coverage) object.
 *
 * It is important to note that this class is meant to be used in testing and not during production.
 */
// This class is hard to test since depending on many Temporal internals
/* istanbul ignore next */
export class WorkflowCoverage {
    readonly #coverageMapsData: libCoverage.CoverageMapData[] = [];

    /**
     * Get sinks configuration for coverage collection.
     * If `callDuringReplay` is true, the sink will be called during replay and the code coverage will be tracked.
     */
    getSinksForCoverage(callDuringReplay = true): InjectedSinks<CoverageSinks> {
        return {
            coverage: {
                merge: {
                    fn: (_workflowInfo, testCoverage: string) => {
                        const coverageData: libCoverage.CoverageMapData = JSON.parse(testCoverage);
                        this.#coverageMapsData.push(coverageData);
                    },
                    callDuringReplay,
                },
            },
        };
    }

    /**
     * Add sinks to Worker options. Use this method if you are passing a pre-built
     * bundle that was built with `augmentBundleOptions()`.
     */
    augmentWorkerOptionsWithBundle(
        workerOptions: WorkerOptions & {
            workflowBundle: NonNullable<WorkerOptions['workflowBundle']>;
        }
    ): WorkerOptions {
        if (!workerOptions.workflowBundle) {
            throw new TypeError(
                'Cannot call `augmentWorkerOptionsWithBundle()` unless you specify a `workflowBundle`. Perhaps you meant to use `augmentBundleOptions()` instead?'
            );
        }

        return {
            ...workerOptions,
            sinks: {
                ...workerOptions.sinks,
                ...this.getSinksForCoverage(),
            },
        };
    }

    /**
     * Retrieves the coverage data from the workflow execution and resets the collected coverage data.
     * @returns Jest's compatible coverage data.
     */
    popJestCoverageData(externalCoverage?: any) {
        const workflowCoverage = libCoverage.createCoverageMap();

        for (const data of this.#coverageMapsData) {
            workflowCoverage.merge(data);
        }

        if (externalCoverage) {
            workflowCoverage.merge(libCoverage.createCoverageMap(externalCoverage));
        }

        this.#coverageMapsData.length = 0;

        // Normalize the workflow coverage to the Jest coverage format
        return convertToJestCoverageFormat(workflowCoverage.data);
    }
}
