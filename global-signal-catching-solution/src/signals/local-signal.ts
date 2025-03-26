import { defineSignal } from '@temporalio/workflow';
import {GlobalSignalInput} from "./signal-data/GlobalSignalInput";

export const localSignal = defineSignal<[GlobalSignalInput]>('local');
