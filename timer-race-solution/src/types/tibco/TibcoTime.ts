import { DateTime } from 'luxon';

export class TibcoTime {
    private _time: DateTime;
    public _internalType = this.constructor.name;

    constructor(hour: number, minute: number, second: number, millisecond: number) {
        this._time = DateTime.fromObject({
            hour,
            minute,
            second,
            millisecond,
        });
    }

    public static now(): TibcoTime {
        const now = DateTime.now();
        return new TibcoTime(now.hour, now.minute, now.second, now.millisecond);
    }
}
