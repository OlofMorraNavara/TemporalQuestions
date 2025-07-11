import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './temporalActivities';
import type { FastifyBaseLogger } from 'fastify';
import getCloudConfig from './config';
import { getConnectionOptions } from './connection_options';

export const createFastifyWorkerConnection = async (logger: FastifyBaseLogger): Promise<NativeConnection> => {
    // Establish a connection with Temporal server.
    return await NativeConnection.connect(await getConnectionOptions());
};

export const createLocalConnection = async (): Promise<NativeConnection> => {
    // Establish a connection with Temporal server.
    return NativeConnection.connect({});
};

export async function createWorker(
    connection: NativeConnection,
    config: { TEMPORAL_WORKER_QUEUE: string; TEMPORAL_NAMESPACE: string }
): Promise<Worker> {
    // Register Workflows and Activities with the Worker.
    const worker = await Worker.create({
        connection,
        namespace: config.TEMPORAL_NAMESPACE,
        taskQueue: config.TEMPORAL_WORKER_QUEUE,
        // Workflows are registered using a path as they run in a separate JS context.
        workflowsPath: require.resolve('./workflows/index'),
        dataConverter: {
            payloadConverterPath: require.resolve('./payload-converter'),
        }, // TODO payload encryption
        activities,
    });

    return worker;
}
