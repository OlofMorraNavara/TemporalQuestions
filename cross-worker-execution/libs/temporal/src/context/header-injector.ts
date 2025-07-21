import { defaultPayloadConverter, type Headers } from '@temporalio/common';

export interface HeaderInjector<Data extends Record<string, any> = Record<string, any>> {
    mergeDataWithHeaders: (headers: Headers, data: Data | undefined) => Headers;
    getDataFromHeaders: (headers: Headers) => Data | undefined;
    headerName: string;
}

/**
 * Utility to consistently inject and extract data from and into a specified header.
 */
export const createHeaderInjector = <Data extends Record<string, any>>(
    headerName: string,
    payloadConverter = defaultPayloadConverter
): HeaderInjector<Data> => {
    function mergeDataWithHeaders(headers: Headers, data: Data | undefined): Headers {
        if (!data) {
            return headers;
        }

        return {
            ...headers,
            [headerName]: payloadConverter.toPayload(data),
        };
    }

    function getDataFromHeaders(headers: Headers): Data | undefined {
        const header = headers[headerName];

        if (!header) {
            return undefined;
        }

        return payloadConverter.fromPayload(header) as Data;
    }

    return {
        mergeDataWithHeaders,
        getDataFromHeaders,
        headerName,
    };
};
