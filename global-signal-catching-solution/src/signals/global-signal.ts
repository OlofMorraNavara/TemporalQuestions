import { defineSignal } from '@temporalio/workflow';
import {GlobalSignalInput} from "./signal-data/GlobalSignalInput";

export const globalSignal = defineSignal<[GlobalSignalInput]>('global');
