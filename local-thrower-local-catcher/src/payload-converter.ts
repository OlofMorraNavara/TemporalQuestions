import {
    CompositePayloadConverter,
    EncodingType,
    METADATA_ENCODING_KEY,
    PayloadConverterWithEncoding,
    UndefinedPayloadConverter,
} from '@temporalio/common';
import { Payload } from '@temporalio/client';
import { decode, encode } from '@temporalio/common/lib/encoding';
import { TibcoList } from './types/tibco/TibcoList';
import { TibcoDate, TibcoDateTime, TibcoDateTimetz, TibcoDuration, TibcoTime } from './types/tibco/types';
import { DateTime, Duration } from 'luxon';

export class TibcoPayloadConverter implements PayloadConverterWithEncoding {
    public encodingType = 'json/plain' as EncodingType;

    fromPayload<T>(payload: Payload): T {
        let result = JSON.parse(decode(payload.data));
        return this.replaceObjectsByTibcoTypes(result);
    }

    toPayload<T>(value: T): Payload {
        return {
            metadata: {
                [METADATA_ENCODING_KEY]: encode('json/plain'),
            },
            data: encode(JSON.stringify(value)),
        };
    }

    private replaceObjectsByTibcoTypes<T>(obj: T): T {
        function convertToTibcoType(value: any): any {
            if (
                value &&
                typeof value === 'object' &&
                !Array.isArray(value) &&
                // eslint-disable-next-line no-prototype-builtins
                value.hasOwnProperty('_internalType')
            ) {
                switch (value._internalType) {
                    case TibcoList.name:
                        return new TibcoList(value._items.map((v) => traverse(v)));
                    case TibcoDate.name:
                        return new TibcoDate(value._date.year, value._date.month, value._date.day);
                    case TibcoDateTime.name:
                        return new TibcoDateTime(
                            value._dateTime.year,
                            value._dateTime.month,
                            value._dateTime.day,
                            value._dateTime.hour,
                            value._dateTime.minute,
                            value._dateTime.second,
                            value._dateTime.millisecond
                        );
                    case TibcoDateTimetz.name:
                        return new TibcoDateTimetz(
                            value._dateTime.year,
                            value._dateTime.month,
                            value._dateTime.day,
                            value._dateTime.hour,
                            value._dateTime.minute,
                            value._dateTime.second,
                            value._dateTime.millisecond
                        );
                    case TibcoDuration.name:
                        const duration = Duration.fromISO(value._duration);
                        return new TibcoDuration(
                            duration.years,
                            duration.months,
                            duration.days,
                            duration.hours,
                            duration.minutes,
                            duration.seconds,
                            duration.milliseconds
                        );
                    case TibcoTime.name:
                        return new TibcoTime(
                            value._time.hour,
                            value._time.minute,
                            value._time.second,
                            value._time.millisecond
                        );
                }
            }
            return value;
        }

        function traverse(current: any): any {
            if (Array.isArray(current)) {
                return current.map(traverse);
            } else if (current && typeof current === 'object') {
                const converted = convertToTibcoType(current);
                if (converted != current) {
                    return converted;
                }
                for (const key in current) {
                    if (current.hasOwnProperty(key)) {
                        current[key] = traverse(current[key]);
                    }
                }
            }
            return current;
        }
        return traverse(obj);
    }
}

export const payloadConverter = new CompositePayloadConverter(
    new UndefinedPayloadConverter(),
    new TibcoPayloadConverter()
);
