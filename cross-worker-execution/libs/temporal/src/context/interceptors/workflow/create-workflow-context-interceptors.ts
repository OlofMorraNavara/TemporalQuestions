/* istanbul ignore file */
import { type WorkflowInterceptors } from '@temporalio/workflow';
import { contextInjector } from '../../context-injector';
import { workflowContextManager } from '../../workflow-context-manager';
import { ContextWorkflowInboundInterceptor } from './workflow-context-inbound-interceptors';
import { ContextWorkflowInternalsInterceptor } from './workflow-context-internals-interceptors';
import { ContextWorkflowOutboundInterceptor } from './workflow-context-outbound-interceptors';

export const createWorkflowContextInterceptors = (): WorkflowInterceptors => {
    const inboundInterceptor = new ContextWorkflowInboundInterceptor(contextInjector, workflowContextManager);
    const outboundInterceptor = new ContextWorkflowOutboundInterceptor(contextInjector, workflowContextManager);
    const internalsInterceptor = new ContextWorkflowInternalsInterceptor(workflowContextManager);

    return {
        inbound: [inboundInterceptor],
        outbound: [outboundInterceptor],
        internals: [internalsInterceptor],
    };
};
