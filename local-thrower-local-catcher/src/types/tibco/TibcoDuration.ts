import { Duration } from "luxon";

/**
 * Implementation of interface described at https://docs.tibco.com/pub/amx-bpm/4.3.3/doc/html/Default.htm#Business-Data-Services-Developer-Guide/duration-methods.htm?TocPath=Business%2520Data%2520Services%2520Developer%2520Guide%257CBusiness%2520Data%2520Scripting%257CBOM%2520Native%2520Type%2520Methods%257C_____4
 */
export class TibcoDuration {
  private _duration: Duration;
  public _internalType = this.constructor.name;

  public constructor(
    years: number,
    months: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds?: number,
  ) {
    this._duration = Duration.fromObject({
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    });
  }

  public getDuration(): Duration {
    return this._duration;
  }

  public getMilliseconds(): number {
    return this._duration.as("milliseconds");
  }

  static reviveTibcoDuration(durationObject: any): TibcoDuration {
    const duration = Duration.fromISO(durationObject._duration);
    return new TibcoDuration(
      duration.years ?? 0,
      duration.months ?? 0,
      duration.days ?? 0,
      duration.hours ?? 0,
      duration.minutes ?? 0,
      duration.seconds ?? 0,
      duration.milliseconds ?? 0,
    );
  }
}
