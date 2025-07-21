import { type Sinks } from '@temporalio/workflow';

export interface CoverageSinks extends Sinks {
    coverage: {
        merge(coverageMap: string): void;
    };
}
