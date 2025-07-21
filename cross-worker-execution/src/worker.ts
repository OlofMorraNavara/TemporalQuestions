import { Worker } from '@temporalio/worker';
import * as activities1 from './workflow-A/activities';
import * as activities2 from './workflow-B/activities';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import path from 'node:path';

async function run() {
    const worker1 = await Worker.create({
        workflowsPath: require.resolve('./workflow-A/workflow'),
        taskQueue: 'process-group-1',
        activities: activities1,
        bundlerOptions: {
            webpackConfigHook(config) {
                if (!config.resolve) config.resolve = {};
                if (!config.resolve.plugins) config.resolve.plugins = [];

                config.resolve.plugins.push(
                    new TsconfigPathsPlugin({
                        configFile: path.resolve(__dirname, '../tsconfig.json'),
                    })
                );

                return config;
            },
        },
    });

    const worker2 = await Worker.create({
        workflowsPath: require.resolve('./workflow-B/workflow'),
        taskQueue: 'process-group-2',
        activities: activities2,
        bundlerOptions: {
            webpackConfigHook(config) {
                if (!config.resolve) config.resolve = {};
                if (!config.resolve.plugins) config.resolve.plugins = [];

                config.resolve.plugins.push(
                    new TsconfigPathsPlugin({
                        configFile: path.resolve(__dirname, '../tsconfig.json'),
                    })
                );

                return config;
            },
        },
    });

    await Promise.all([worker1.run(), worker2.run()]);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
