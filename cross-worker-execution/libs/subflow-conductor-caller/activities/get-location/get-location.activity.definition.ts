import { defineActivity } from '@integration/temporal';
import { Location } from '../../context';

export const getLocationDefinition = defineActivity('getLocation')<
    { runtimeIdentifier: string; conductorUrl: string },
    Location
>();
