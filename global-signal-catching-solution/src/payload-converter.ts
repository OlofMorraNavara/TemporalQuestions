import {
  CompositePayloadConverter,
  EncodingType,
  METADATA_ENCODING_KEY,
  PayloadConverterWithEncoding,
  UndefinedPayloadConverter,
} from "@temporalio/common";
import { Payload } from "@temporalio/client";
import { decode, encode } from "@temporalio/common/lib/encoding";
import { TibcoList } from "./types/tibco/TibcoList";
import {
  TibcoDate,
  TibcoDateTime,
  TibcoDateTimetz,
  TibcoDuration,
  TibcoTime,
} from "./types/tibco/types";

export class TibcoPayloadConverter implements PayloadConverterWithEncoding {
  public encodingType = "json/plain" as EncodingType;

  fromPayload<T>(payload: Payload): T {
    let result = JSON.parse(decode(payload.data));
    return this.replaceObjectsByTibcoTypes(result);
  }

  toPayload<T>(value: T): Payload {
    return {
      metadata: {
        [METADATA_ENCODING_KEY]: encode("json/plain"),
      },
      data: encode(JSON.stringify(value)),
    };
  }

  private replaceObjectsByTibcoTypes<T>(obj: T): T {
    function traverse(current: any, parentKey: string = ""): T | object {
      for (const key in current) {
        // eslint-disable-next-line no-prototype-builtins
        if (current.hasOwnProperty(key)) {
          const value = current[key];
          if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            // eslint-disable-next-line no-prototype-builtins
            value.hasOwnProperty("_internalType")
          ) {
            switch (value._internalType) {
              case TibcoList.name:
                current[key] = new TibcoList(
                  value._items.map((v) => {
                    return traverse(v, key);
                  }),
                );
                break;
              case TibcoDate.name:
                current[key] = new TibcoDate(
                  value._date.year,
                  value._date.month,
                  value._date.day,
                );
                break;
              case TibcoDateTime.name:
                current[key] = new TibcoDateTime(
                  value._dateTime.year,
                  value._dateTime.month,
                  value._dateTime.day,
                  value._dateTime.hour,
                  value._dateTime.minute,
                  value._dateTime.second,
                  value._dateTime.millisecond,
                );
                break;
              case TibcoDateTimetz.name:
                current[key] = new TibcoDateTimetz(
                  value._dateTime.year,
                  value._dateTime.month,
                  value._dateTime.day,
                  value._dateTime.hour,
                  value._dateTime.minute,
                  value._dateTime.second,
                  value._dateTime.millisecond,
                );
                break;
              case TibcoDuration.name:
                current[key] = new TibcoDuration(
                  value._duration.years,
                  value._duration.months,
                  value._duration.days,
                  value._duration.hours,
                  value._duration.minutes,
                  value._duration.seconds,
                  value._duration.milliseconds,
                );
                break;
              case TibcoTime.name:
                current[key] = new TibcoTime(
                  value._time.hour,
                  value._time.minute,
                  value._time.second,
                  value._time.millisecond,
                );
                break;
            }
          } else if (
            value && typeof value === "object" && !Array.isArray(value)
          ) {
            current[key] = traverse(value, key);
          }
        }
      }
      return current;
    }

    traverse(obj);
    return obj;
  }
}

export const payloadConverter = new CompositePayloadConverter(
  new UndefinedPayloadConverter(),
  new TibcoPayloadConverter(),
);
