import type { TemporalTestEnvironmentConfig } from '@integration/temporal/temporal-testing';
import { workflowBundler } from '@integration/temporal/tooling';
import { type WorkflowBundleWithSourceMap } from '@temporalio/worker';
import type { WorkflowCoverage } from './workflow-coverage';

type BundlerConfig = {
    workflowCoverageHelper: InstanceType<typeof WorkflowCoverage>;
} & Omit<TemporalTestEnvironmentConfig, 'tsConfigFile'> &
    Required<Pick<TemporalTestEnvironmentConfig, 'tsConfigFile'>>;

export function bundleWorkflowForTesting(config: BundlerConfig): Promise<WorkflowBundleWithSourceMap> {
    const { workflowInterceptorModules = [] } = config.bundleOptions ?? {};

    return workflowBundler({
        ...config,
        workflowInterceptorModules: [...workflowInterceptorModules, require.resolve('./coverage-interceptors')],
        collectCoverage: true,
    }).bundleForTesting();
}
