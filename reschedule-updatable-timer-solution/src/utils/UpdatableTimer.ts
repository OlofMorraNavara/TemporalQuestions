import * as wf from '@temporalio/workflow';

// implementation
export class UpdatableTimer implements PromiseLike<void> {
	deadlineUpdated = false;
	#deadline: number;

	constructor(deadline: number) {
		this.#deadline = deadline;
	}

	private async run(): Promise<void> {
		/* eslint-disable no-constant-condition */
		while (true) {
			this.deadlineUpdated = false;
			if (
				!(await wf.condition(
					() => this.deadlineUpdated,
					this.#deadline - Date.now(),
				))
			) {
				break;
			}
		}
	}

	then<TResult1 = void, TResult2 = never>(
		onfulfilled?: (value: void) => TResult1 | PromiseLike<TResult1>,
		onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>,
	): PromiseLike<TResult1 | TResult2> {
		return this.run().then(onfulfilled, onrejected);
	}

	set deadline(value: number) {
		this.#deadline = value;
		this.deadlineUpdated = true;
	}

	get deadline(): number {
		return this.#deadline;
	}
}