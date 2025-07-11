import closeWithgrace from 'close-with-grace';
import fastify from 'fastify';
import type { NativeConnection, Worker } from '@temporalio/worker';
import getCloudConfig from '../config';
import { createFastifyWorkerConnection, createWorker } from '../worker';

const runningWorkers: Array<{
    worker: Worker;
    runPromise: Promise<void>;
}> = [];
let connection: NativeConnection | null = null;

// https://fastify.dev/docs/latest/Guides/Getting-Started/
const app = fastify({
    logger: {
        level: 'info',
        formatters: {
            // Map loglevel to a label instead of the numeric value
            level: (label) => ({
                level: label,
            }),
        },
    },
});

app.addHook('onReady', async () => {
    connection = await createFastifyWorkerConnection(app.log);
    // create all workers and start them
    const worker = await createWorker(connection, getCloudConfig());
    runningWorkers.push({
        runPromise: worker.run(),
        worker,
    });
});

app.addHook('onClose', async () => {
    // signal all workers to shutdown
    runningWorkers.forEach(({ worker }) => worker.shutdown());
    // wait for all workers to stop
    await Promise.all(runningWorkers.map(({ runPromise }) => runPromise));

    await connection?.close();
});

app.addHook('onRoute', (opts) => {
    if (opts.path === '/healthcheck') {
        opts.logLevel = 'silent';
    }
});

app.get(
    '/healthcheck',
    {
        // dont polute logs with healthcheck requests
        logLevel: 'warn',
    },
    async () => {
        const config = getCloudConfig();
        return {
            ok: true,
            region: config.AWS_REGION,
            stage: config.STAGE,
            service: config.SERVICE,
        };
    }
);

app.listen(
    {
        port: process.env.PORT ? Number(process.env.PORT) : 3003,
        host: '0.0.0.0',
    },
    function (err, _address) {
        if (err) {
            app.log.error(err);
            process.exit(1);
        }
    }
);

export const start = async () => {
    try {
        await app.listen({ port: 3000 });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

// enable graceful shutdown
// https://github.com/mcollina/close-with-grace
closeWithgrace(
    {
        delay: 10000,
    },
    async function ({ err, signal, manual }) {
        if (err) {
            app.log.error({ err, signal, manual });
            process.exit(1);
        }
        await app.close();
    }
);
