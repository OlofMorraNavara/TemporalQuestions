import { defineActivity } from '@integration/temporal';
import { LocationTemporal } from '../../context';

export const runTemporalDefinition = defineActivity('runTemporal')<
    { location: LocationTemporal; input: any },
    string
>();
