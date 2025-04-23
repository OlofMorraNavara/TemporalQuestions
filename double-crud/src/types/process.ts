type Payload = any;

interface CRUDProcessInput {
  entityType: string;
  payload: Payload;
}

export interface CreateCRUDProcessInput extends CRUDProcessInput {
  operation: 'CREATE';
}


export interface UpdateCRUDProcessInput extends CRUDProcessInput {
  entityId: string
  operation: 'UPDATE';
}


export type BPMProcessStatusResult = | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TERMINATED';