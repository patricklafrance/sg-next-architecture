import { ApiError } from "./ApiError.ts";
import { httpGet, httpPost, type HttpClientOptions, type HttpClientResponse } from "./httpClient.ts";

export const ApiTimeoutInMs = 3000;
export const ApiRetryDelayInMs = 500;
export const ApiRateLimitedRetryDelayUnitInMs = 2000;

export interface ApiClientOptions extends HttpClientOptions {}

function createRequestOptions(options: ApiClientOptions = {}, additionalHeaders: HeadersInit = {}): HttpClientOptions {
    const {
        headers,
        // API response should never be the result of a redirected request. Disabling by default to prevent forged requests.
        redirect = "error",
        timeoutInMs = ApiTimeoutInMs,
        ...rest
    } = options;

    return {
        headers: {
            ...additionalHeaders,
            ...headers
        },
        credentials: "include",
        redirect,
        timeoutInMs,
        ...rest
    };
}

type Executor = () => Promise<HttpClientResponse>;

async function executeRequest(executor: Executor) {
    const response = await executor();

    if (!response.ok) {
        throw new ApiError(response);
    }

    return response;
}

export interface ApiClientGetJsonResponse {
    data: HttpClientResponse["data"];
    headers: HttpClientResponse["headers"];
    correlationId?: HttpClientResponse["correlationId"];
}

export async function getJson(url: string, options: ApiClientOptions = {}): Promise<ApiClientGetJsonResponse> {
    const { headers, ...requestOptions } = createRequestOptions(options, {
        "Content-Type": "application/json"
    });

    const executor = () => httpGet(url, {
        ...requestOptions,
        headers
    });

    const response = await executeRequest(executor);

    return {
        data: response.data,
        headers: response.headers,
        correlationId: response.correlationId
    };
}

export interface ApiClientGetBlobResponse {
    data: Blob;
    headers: HttpClientResponse["headers"];
    correlationId?: HttpClientResponse["correlationId"];
}

export interface ApiClientPostJsonResponse {
    data: HttpClientResponse["data"];
    headers: HttpClientResponse["headers"];
    correlationId?: HttpClientResponse["correlationId"];
}

export async function postJson(url: string, data?: unknown, options: ApiClientOptions = {}): Promise<ApiClientPostJsonResponse> {
    const { headers, ...requestOptions } = createRequestOptions(options, {
        "Content-Type": "application/json"
    });

    const jsonData = data ? JSON.stringify(data) : undefined;

    const executor = () => httpPost(url, jsonData, {
        ...requestOptions,
        headers
    });

    const response = await executeRequest(executor);

    return {
        data: response.data,
        headers: response.headers,
        correlationId: response.correlationId
    };
}
