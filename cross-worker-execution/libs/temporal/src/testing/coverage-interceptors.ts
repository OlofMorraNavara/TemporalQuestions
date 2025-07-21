import { type CoverageMapData, createCoverageMap } from 'istanbul-lib-coverage';
import { proxySinks, type WorkflowInterceptors } from '@temporalio/workflow';
import type { CoverageSinks } from './coverage-sinks';

const { coverage: sunkCoverage } = proxySinks<CoverageSinks>();

// this is worker internal, so it's not covered by tests
/* istanbul ignore next */
function clearCoverage(coverage: CoverageMapData): void {
    for (const path of Object.keys(coverage)) {
        for (const index of Object.keys(coverage[path].s)) {
            coverage[path].s[index] = 0;
        }
    }
}

// It is important to export the interceptors in this way: `export const interceptors`.
// This is due to the way the Temporal compiler works, it uses `export.interceptors` to inject the interceptors into the workflow.
export const interceptors = (): WorkflowInterceptors => ({
    internals: [
        {
            concludeActivation(input, next) {
                // @ts-expect-error TS7017
                const globalCoverage: CoverageMapData = global.__coverage__;
                if (globalCoverage) {
                    // Send coverage data through the sink to be merged into the _real_ global coverage map
                    // Make a deep copy first, otherwise clearCoverage may wipe out the data
                    // before it actually get processed by the sink
                    const coverageMap = createCoverageMap(globalCoverage);
                    sunkCoverage.merge(JSON.stringify(coverageMap.toJSON()));
                    clearCoverage(globalCoverage);
                }

                return next(input);
            },
        },
    ],
});
