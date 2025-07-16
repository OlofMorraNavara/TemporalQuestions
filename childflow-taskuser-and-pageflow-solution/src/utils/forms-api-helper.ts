import axios, { AxiosError } from 'axios';

const BASE_URL = 'http://localhost:3000';

export interface StartTaskPayload {
	taskId: string;
	workflowId: string;
	signalNameBase: string;
}

/**
 * Sends a POST request to the Forms API to start a task.
 * @param payload
 */
export async function startTask(
	payload: StartTaskPayload
): Promise<void> {
	const url = `${BASE_URL}/task`;
	try {
		await axios.post(url, payload);
	} catch (err) {
		if (axios.isAxiosError(err)) {
			const error = err as AxiosError;
			console.error(error);
			throw new Error(`Failed to start task: ${error.response?.status} ${error.response?.statusText} - ${error.message}`);
		}
		throw err;
	}
}


/**
 * Sends a DELETE request to the Forms API to complete a task.
 * @param taskId
 */
export async function completeTask(
	taskId: string
): Promise<void> {
	const url = `${BASE_URL}/task/${taskId}`;
	try {
		await axios.delete(url);
	} catch (err) {
		if (axios.isAxiosError(err)) {
			const error = err as AxiosError;
			throw new Error(`Failed to complete task: ${error.response?.status} ${error.response?.statusText} - ${error.message}`);
		}
		throw err;
	}
}

export interface StartFormPayload {
	childWorkflowId: string;
	childSignalNameBase: string;
	formUri: string;
	tibcoWorkflowId: string;
	data?: Record<string, unknown>;
}

/**
 * Sends a POST request to the Forms API to start a form.
 * @param taskId - The ID of the task to which the form is associated.
 * @param payload - Payload including task ID, child workflow ID, signal name, form URI, and data.
 */
export async function startForm(
	taskId: string,
	payload: StartFormPayload
): Promise<void> {
	const url = `${BASE_URL}/task/${taskId}/form`;
	try {
		await axios.post(url, payload);
	} catch (err) {
		if (axios.isAxiosError(err)) {
			const error = err as AxiosError;
			throw new Error(`Failed to start form: ${error.response?.status} ${error.response?.statusText} - ${error.message}`);
		}
		throw err;
	}
}

/**
 * Sends a DELETE request to the Forms API to withdraw a form.
 * @param payload - Payload including workflow ID and signal name.
 */
export async function withdrawForm(
	payload: WithdrawFormPayload
): Promise<void> {
	const url = `${BASE_URL}/forms`;
	try {
		await axios.delete(url, {
			data: payload
		});
	} catch (err) {
		if (axios.isAxiosError(err)) {
			const error = err as AxiosError;
			throw new Error(`Failed to withdraw form: ${error.response?.status} ${error.response?.statusText} - ${error.message}`);
		}
		throw err;
	}
}

export interface WithdrawFormPayload {
	workflowId: string;
	signalName: string;
}


/**
 * Sends a PATCH request to the Forms API to update form data.
 * To be executed after an open or closed script is executed.
 * @param taskId
 * @param payload
 */
export async function updateFormData(
	taskId: string,
	payload: any
): Promise<void> {
	const url = `${BASE_URL}/task/${taskId}/form`;
	try {
		await axios.patch(url, payload);
	} catch (err) {
		if (axios.isAxiosError(err)) {
			const error = err as AxiosError;
			throw new Error(`Failed to update form data: ${error.response?.status} ${error.response?.statusText} - ${error.message}`);
		}
		throw err;
	}
}
