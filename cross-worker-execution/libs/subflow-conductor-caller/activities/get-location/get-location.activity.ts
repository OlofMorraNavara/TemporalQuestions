import axios from 'axios';
import { Location, LocationTemporal, LocationTibco } from '../../context';

export async function getLocation(input: { runtimeIdentifier: string; conductorUrl: string }): Promise<Location> {
    const runtimeIdentifier = input.runtimeIdentifier;
    // const response = await axios.post(`${input.conductorUrl}/location`, {
    //   runtimeIdentifier,
    // });

    const response = {
        status: 200,
        data: {
            type: 'TEMPORAL',
            workflowId: 'workflowB',
            taskQueue: 'process-group-2',
            name: 'WorkflowB',
        },
        statusText: 'OK',
    };

    if (response.status !== 200) {
        throw new Error(
            `Failed to get location for runtimeIdentifier ${input.runtimeIdentifier}: ${response.statusText}`
        );
    }

    if (response.data.type === 'TEMPORAL') {
        return {
            type: 'TEMPORAL',
            workflowId: response.data.workflowId,
            taskQueue: response.data.taskQueue,
            name: response.data.name,
        } as LocationTemporal;
    } else {
        return {
            type: 'TIBCO',
            processName: '',
            operation: '',
            version: '',
        } as LocationTibco;
    }
}
