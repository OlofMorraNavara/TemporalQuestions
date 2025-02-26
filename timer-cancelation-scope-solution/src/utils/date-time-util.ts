import { TibcoDateTime, TibcoDateTimetz, TibcoDate, TibcoTime, TibcoDuration } from '../types/tibco/types';

/**
 * Utility class implementing defined interface https://docs.tibco.com/pub/amx-bpm/4.3.3/doc/html/Default.htm#Business-Data-Services-Developer-Guide/datetimeutil.htm?TocPath=Business%2520Data%2520Services%2520Developer%2520Guide%257CBusiness%2520Data%2520Scripting%257CStatic%2520Factory%2520Methods%257C_____1
 */
export class DateTimeUtil {
    public static createDatetime(
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        second: number,
        millisecond: number
    ): TibcoDateTime;
    public static createDatetime(dateTime: TibcoDateTime): TibcoDateTime;
    public static createDatetime(): TibcoDateTime;
    public static createDatetime(
        yearOrDateTime?: number | TibcoDateTime,
        month?: number,
        day?: number,
        hour?: number,
        minute?: number,
        second?: number,
        millisecond?: number
    ): TibcoDateTime {
        if (yearOrDateTime === undefined) {
            return TibcoDateTime.now();
        } else if (yearOrDateTime instanceof TibcoDateTime) {
            return new TibcoDateTime(
                yearOrDateTime.getYear(),
                yearOrDateTime.getMonth(),
                yearOrDateTime.getDay(),
                yearOrDateTime.getHour(),
                yearOrDateTime.getMinute(),
                yearOrDateTime.getSecond(),
                yearOrDateTime.getMillisecond()
            );
        } else if (
            month !== undefined &&
            day !== undefined &&
            hour !== undefined &&
            minute !== undefined &&
            second !== undefined &&
            millisecond !== undefined
        ) {
            return new TibcoDateTime(yearOrDateTime, month, day, hour, minute, second, millisecond);
        } else {
            throw new Error('Invalid arguments');
        }
    }

    public static createDatetimetz(
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        second: number,
        millisecond: number
    ): TibcoDateTimetz;
    public static createDatetimetz(dateTime: TibcoDateTime): TibcoDateTimetz;
    public static createDatetimetz(): TibcoDateTimetz;
    public static createDatetimetz(
        yearOrDateTime?: number | TibcoDateTime,
        month?: number,
        day?: number,
        hour?: number,
        minute?: number,
        second?: number,
        millisecond?: number
    ): TibcoDateTimetz {
        if (yearOrDateTime === undefined) {
            return TibcoDateTimetz.now();
        } else if (yearOrDateTime instanceof TibcoDateTime) {
            return new TibcoDateTimetz(
                yearOrDateTime.getYear(),
                yearOrDateTime.getMonth(),
                yearOrDateTime.getDay(),
                yearOrDateTime.getHour(),
                yearOrDateTime.getMinute(),
                yearOrDateTime.getSecond(),
                yearOrDateTime.getMillisecond()
            );
        } else if (
            month !== undefined &&
            day !== undefined &&
            hour !== undefined &&
            minute !== undefined &&
            second !== undefined &&
            millisecond !== undefined
        ) {
            return new TibcoDateTimetz(yearOrDateTime, month, day, hour, minute, second, millisecond);
        } else {
            throw new Error('Invalid arguments');
        }
    }

    public static createDate(year: number, month: number, day: number): TibcoDate;
    public static createDate(dateTime: TibcoDateTime): TibcoDate;
    public static createDate(dateTime: TibcoDateTimetz): TibcoDate;
    public static createDate(): TibcoDate;
    public static createDate(
        yearOrDate?: number | TibcoDateTime | TibcoDateTimetz,
        month?: number,
        day?: number
    ): TibcoDate {
        if (yearOrDate === undefined) {
            return TibcoDate.now();
        } else if (yearOrDate instanceof TibcoDateTime || yearOrDate instanceof TibcoDateTimetz) {
            return new TibcoDate(yearOrDate.getYear(), yearOrDate.getMonth(), yearOrDate.getDay());
        } else if (month !== undefined && day !== undefined) {
            return new TibcoDate(yearOrDate, month, day);
        } else {
            throw new Error('Invalid arguments');
        }
    }

    public static createTime(hour: number, minute: number, second: number, millisecond: number): TibcoTime;
    public static createTime(dateTime: TibcoDateTime): TibcoTime;
    public static createTime(): TibcoTime;
    public static createTime(
        hourOrDateTime?: number | TibcoDateTime,
        minute?: number,
        second?: number,
        millisecond?: number
    ): TibcoTime {
        if (hourOrDateTime === undefined) {
            return TibcoTime.now();
        } else if (hourOrDateTime instanceof TibcoDateTime) {
            return new TibcoTime(
                hourOrDateTime.getHour(),
                hourOrDateTime.getMinute(),
                hourOrDateTime.getSecond(),
                hourOrDateTime.getMillisecond()
            );
        } else if (minute !== undefined && second !== undefined && millisecond !== undefined) {
            return new TibcoTime(hourOrDateTime, minute, second, millisecond);
        } else {
            throw new Error('Invalid arguments');
        }
    }

    public static createDuration(
        years: number,
        months: number,
        days: number,
        hours: number,
        minutes: number,
        seconds: number
    ): TibcoDuration;
    public static createDuration(durationInMilliseconds: number): TibcoDuration;
    /**
     * This obtains a new instance of a Duration specifying the Duration as its string representation PnYnMnDTnHnMnS.
     * @param lexicalRepresentation
     */
    public static createDuration(lexicalRepresentation: string): TibcoDuration;
    public static createDuration(
        yearsMillisecondsOrLexical: number | string,
        months?: number,
        days?: number,
        hours?: number,
        minutes?: number,
        seconds?: number
    ): TibcoDuration {
        if (
            typeof yearsMillisecondsOrLexical === 'number' &&
            months !== undefined &&
            days !== undefined &&
            hours !== undefined &&
            minutes !== undefined &&
            seconds !== undefined
        ) {
            return new TibcoDuration(yearsMillisecondsOrLexical, months, days, hours, minutes, seconds);
        } else if (typeof yearsMillisecondsOrLexical === 'number' && months === undefined) {
            return new TibcoDuration(0, 0, 0, 0, 0, 0, yearsMillisecondsOrLexical);
        } else if (typeof yearsMillisecondsOrLexical === 'string') {
            // TODO: Implement parsing of lexical representation
            return new TibcoDuration(0, 0, 0, 0, 0, 0, 0);
        }

        throw new Error('Invalid arguments');
    }
}
