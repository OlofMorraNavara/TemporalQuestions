import type { Context } from './context.interface';
import { createHeaderInjector } from './header-injector';

export const contextInjector = createHeaderInjector<Context>('context');
