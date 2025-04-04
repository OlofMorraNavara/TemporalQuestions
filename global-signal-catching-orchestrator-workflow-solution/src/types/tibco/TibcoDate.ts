import { DateTime } from "luxon";

export class TibcoDate {
  private _date: DateTime;
  public _internalType = this.constructor.name;

  constructor(year: number, month: number, day: number) {
    this._date = DateTime.fromObject({
      year,
      month,
      day,
    });
  }

  public static now(): TibcoDate {
    const now = DateTime.now();
    return new TibcoDate(now.year, now.month, now.day);
  }
}
