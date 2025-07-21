import { builtinModules } from 'node:module';
import path from 'node:path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import type { ExternalItemFunctionData, ExternalItemValue } from 'webpack';
import { type BundleOptions, bundleWorkflowCode } from '@temporalio/worker';

/**
 * @see https://github.com/temporalio/sdk-typescript/blob/3088f86ce6fe0c7072ba55c4db901a70b631f87e/packages/worker/src/workflow/bundler.ts
 *
 * Temporal workflow bundles should never include the following dependencies, because they
 * - are a part of the runtime environment and therefor always available
 * - will break determinism (looking at you node:crypto!)
 *
 * Module `enhanced-resolve` is explicitly ignored because it is not required for production builds and will seriously break your build if it is included.
 * Could not figure out why it ends up in builds, I suspect via a webpack dependency.
 */
const allowedBuiltinModules = ['assert', 'url'];
const disallowedBuiltinModules = builtinModules.filter((module) => !allowedBuiltinModules.includes(module));
const disallowedModules = [
    ...disallowedBuiltinModules,
    '@temporalio/activity',
    '@temporalio/client',
    '@temporalio/worker',
    '@temporalio/common/lib/internal-non-workflow',
    '@temporalio/interceptors-opentelemetry/lib/client',
    '@temporalio/interceptors-opentelemetry/lib/worker',
    '@temporalio/testing',
    '@temporalio/core-bridge',
];
const ignoreModules = ['enhanced-resolve'];

/**
 * @description make sure to pass along any references to filename as absolute paths (e.g by using require.resolve)
 */
type CustomBundleOptions = Pick<
    BundleOptions,
    'logger' | 'workflowsPath' | 'failureConverterPath' | 'workflowInterceptorModules'
> & {
    collectCoverage?: boolean;
    useDefaultFailureConverterPath?: boolean;
    tsConfigFile: string;
};

export const workflowBundler = (options: CustomBundleOptions) => {
    const { collectCoverage = false, useDefaultFailureConverterPath = true, tsConfigFile } = options;

    if (!options.failureConverterPath && useDefaultFailureConverterPath) {
        options.failureConverterPath = require.resolve('../encryption/failure-converter.ts');
    }

    options.workflowInterceptorModules ??= [];
    options.workflowInterceptorModules.push(
        require.resolve('../context/interceptors/workflow/workflow-context-injector-propagator.ts'),
        require.resolve('../interceptors/workflow-search-attributes-propagator.ts')
    );

    async function bundle() {
        return bundleWorkflowCode({
            ...options,
            ignoreModules,
            webpackConfigHook: function (config) {
                config.resolve = config.resolve ?? {};
                config.resolve.modules = config.resolve.modules ?? [];
                config.resolve.plugins = config.resolve.plugins ?? [];
                config.resolve = {
                    ...config.resolve,
                    alias: {
                        ...(config.resolve.alias ?? {}),
                        ...Object.fromEntries([...ignoreModules, ...disallowedModules].map((m) => [m, false])),
                    },
                    plugins: [...config.resolve.plugins, new TsconfigPathsPlugin({ configFile: tsConfigFile })],
                    modules: [...config.resolve.modules, 'libs'],
                };

                config.module = config.module ?? {};
                config.module.rules = config.module.rules ?? [];
                const { rules } = config.module;

                const swcLoaderRuleIndex = rules.findIndex((rule: any) => {
                    const loader = rule?.use?.loader;
                    return loader && loader.indexOf('swc-loader') > -1;
                });

                if (swcLoaderRuleIndex) {
                    rules[swcLoaderRuleIndex] = {
                        test: /\.ts$/,
                        exclude: /node_modules/,
                        // since we are using a monorepo and the libs do not have package.json sideEffects fields,
                        // we set this manually to enable treeshaking
                        sideEffects: false,
                        use: {
                            loader: require.resolve('ts-loader'),
                            options: {
                                transpileOnly: true,
                                configFile: tsConfigFile,
                                compilerOptions: {
                                    sourceMap: true,
                                    // needs to be ESM to enable tree shaking
                                    module: 'es2022',
                                    target: 'es2022',
                                },
                            },
                        },
                    };
                }

                // add a new loader to allow collecting coverage from bundled worker code
                // this is needed if your bundle is running as a worker during a test
                if (collectCoverage) {
                    rules.push({
                        use: {
                            loader: require.resolve(path.join(__dirname, '../testing/instrument-loader')),
                        },
                        enforce: 'post' as const,
                        test: /\.ts$/,
                        exclude: [/[/\\]node_modules[/\\]/],
                    });
                }

                const externalModulesPrefix = ['@swc', 'node:', '@aws-sdk', '@smithy', '@integration/aws-helpers'];
                config.externals = (data: ExternalItemFunctionData): Promise<ExternalItemValue> => {
                    const request = data.request;

                    if (request && externalModulesPrefix.some((prefix) => request.startsWith(prefix))) {
                        // return empty object, which will make the module undefined in the bundle
                        return Promise.resolve({});
                    }

                    return Promise.resolve(false);
                };

                config.optimization = {
                    ...config.optimization,
                    sideEffects: true,
                    providedExports: true,
                    usedExports: true,
                    mangleExports: false,
                };

                return config;
            },
        });
    }

    return {
        bundle: () => bundle().then(({ code }) => code),
        bundleForTesting: () => bundle(),
    };
};
