import { defineActivity } from '@integration/temporal';
import { WorkflowContext } from '../../context';

export const getResultsTemporalDefinition = defineActivity('getResultsTemporal')<{ workflowId: string }, any>();
