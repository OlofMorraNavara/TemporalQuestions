import { ApplicationFailure, proxyActivities, sleep } from "@temporalio/workflow";
import { CreateCRUDProcessInput, UpdateCRUDProcessInput } from "../types/process";
import type * as allActivities from "../temporalActivities";


const activities = proxyActivities<typeof allActivities>({
    // activities can run max for 1 day
    scheduleToCloseTimeout: '1 day',
    retry: {
        maximumInterval: '10 minutes'
    }
});



export async function CRUDProcess(input: CreateCRUDProcessInput | UpdateCRUDProcessInput): Promise<{ bdsId: string }> {
    let bdsId: string;
    if (input.operation === 'CREATE') {
        bdsId = await activities.create(input).then(d => d.bdsId);
    } else if (input.operation === 'UPDATE') {
        bdsId = await activities.update(input).then(d => d.bdsId);
    }

    const { pvmId } = await activities.createBPMCRUDProcess(input);

    await sleep(5000);

    const bpmResult = await activities.waitForBPMCRUDProcess(pvmId);

    switch (bpmResult.status) {
        case 'COMPLETED':
            return {
                bdsId,
            }
        case 'FAILED':
        case 'CANCELLED':
        case 'TERMINATED':
            throw ApplicationFailure.nonRetryable('BPM process failed');
    }
}