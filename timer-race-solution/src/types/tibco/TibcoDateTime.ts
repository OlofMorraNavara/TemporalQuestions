import { DateTime } from 'luxon';
import { TibcoDuration } from './TibcoDuration';

export class TibcoDateTime {
    private _dateTime: DateTime;
    public _internalType = this.constructor.name;

    constructor(
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        second: number,
        millisecond: number
    ) {
        this._dateTime = DateTime.fromObject({
            year,
            month,
            day,
            hour,
            minute,
            second,
            millisecond,
        });
    }

    public static now(): TibcoDateTime {
        const now = DateTime.now();
        return new TibcoDateTime(now.year, now.month, now.day, now.hour, now.minute, now.second, now.millisecond);
    }

    public getYear(): number {
        return this._dateTime.year;
    }

    public getMonth(): number {
        return this._dateTime.month;
    }

    public getDay(): number {
        return this._dateTime.day;
    }

    public getHour(): number {
        return this._dateTime.hour;
    }

    public getMinute(): number {
        return this._dateTime.minute;
    }

    public getSecond(): number {
        return this._dateTime.second;
    }

    public getMillisecond(): number {
        return this._dateTime.millisecond;
    }

    public add(duration: TibcoDuration) {
        const newDateTime = this._dateTime.plus(duration.getDuration());
        return new TibcoDateTime(
            newDateTime.year,
            newDateTime.month,
            newDateTime.day,
            newDateTime.hour,
            newDateTime.minute,
            newDateTime.second,
            newDateTime.millisecond
        );
    }
}
