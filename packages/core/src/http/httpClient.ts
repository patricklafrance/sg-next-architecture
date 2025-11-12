import { fetchWithTimeout } from "./fetchWithTimeout.ts";

export const HttpClientErrorReasons = {
    aborted: "Aborted",
    badGateway: "BadGateway",
    badRequest: "BadRequest",
    concurrencyError: "ConcurrencyError",
    forbidden: "Forbidden",
    gatewayTimeout: "GatewayTimeout",
    internalServerError: "InternalServerError",
    malformedJson: "MalformedJson",
    networkError: "NetworkError",
    notFound: "NotFound",
    preconditionFailed: "PreconditionFailed",
    requestError: "RequestError",
    serviceUnavailable: "ServiceUnavailable",
    timeout: "Timeout",
    tooManyRequests: "TooManyRequests",
    unauthorized: "Unauthorized"
} as const;

export type HttpClientErrorReason = (typeof HttpClientErrorReasons)[keyof typeof HttpClientErrorReasons];

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type GetResponseContent = () => Promise<unknown> | unknown;

export interface HttpClientKnownError {
    status?: number;
    statusText?: string;
    description: string;
    reason: HttpClientErrorReason;
    getResponseContent: GetResponseContent;
}

export interface HttpClientUnknownError {
    status: number;
    statusText: string;
    description: string;
    reason?: undefined;
    getResponseContent: GetResponseContent;
}

export type HttpClientError = HttpClientKnownError | HttpClientUnknownError;

export interface HttpClientRequestOptions extends RequestInit {
    timeoutInMs?: number;
    correlationId?: string;
}

export interface HttpClientRequest {
    url: string;
    options: HttpClientRequestOptions;
}

export interface HttpClientOkResponse {
    ok: true;
    status: number;
    statusText: string;
    error?: undefined;
    data?: unknown;
    contentType?: string;
    contentLength?: number;
    redirected?: boolean;
    headers?: Headers;
    correlationId?: string;
}

export interface HttpClientErrorResponse {
    ok: false;
    status?: number;
    statusText?: string;
    error: HttpClientError;
    data?: unknown;
    contentType?: string;
    contentLength?: number;
    redirected?: boolean;
    headers?: Headers;
    correlationId?: string;
}

export type HttpClientResponse = HttpClientOkResponse | HttpClientErrorResponse;

interface OkResponseOptions {
    data?: unknown;
    contentType?: string;
    contentLength?: number;
    correlationId?: string;
}

function okResponse(response: Response, { data, contentType, contentLength, correlationId }: OkResponseOptions = {}): HttpClientOkResponse {
    return {
        ok: true,
        status: response.status,
        statusText: response.statusText,
        data,
        contentType,
        contentLength,
        redirected: response.redirected,
        headers: response.headers,
        correlationId
    };
}

interface ErrorResponseOptions {
    response?: Response;
    data?: unknown;
    contentType?: string;
    contentLength?: number;
    correlationId?: string;
}

function errorResponse(error: HttpClientError, { response, data, contentType, contentLength, correlationId }: ErrorResponseOptions = {}): HttpClientErrorResponse {
    return {
        ok: false,
        status: response?.status,
        statusText: response?.statusText,
        data,
        contentType,
        contentLength,
        redirected: response?.redirected,
        error,
        headers: response?.headers,
        correlationId
    };
}

type ResponseType = "json" | "unknown" | "none";

function parseResponseType(response: Response): ResponseType {
    const contentType = parseContentType(response);

    if (!contentType) {
        return "none";
    }

    if (contentType.includes("application/json")) {
        return "json";
    }

    return "unknown";
}

function parseContentType(response: Response) {
    return response.headers.get("Content-Type") ?? undefined;
}

function parseContentLength(response: Response) {
    try {
        if (response.headers.has("Content-Length")) {
            return parseInt(response.headers.get("Content-Length")!);
        }
    } catch {
        // do nothing.
    }
}

interface ParsedResponse {
    content: unknown;
    contentType?: string;
    contentLength?: number;
    isMalformed: boolean;
    parsingError?: Error;
}

async function parseJsonResponse(response: Response) {
    let content = await response.text();

    let isMalformed = false;
    let parsingError: Error | undefined = undefined;

    const hasContent = !!content && content !== "";

    // Some backends returns "OK" when the response doesn't include JSON data.
    if (hasContent && content !== "OK") {
        try {
            content = JSON.parse(content);
        } catch (error: unknown) {
            isMalformed = true;
            parsingError = error as Error;
        }
    }

    const contentType = parseContentType(response);
    const contentLength = parseContentLength(response) ?? 0;

    return {
        content,
        contentType,
        contentLength,
        isMalformed,
        parsingError
    } satisfies ParsedResponse;
}

async function parseUnknownResponseType(response: Response) {
    const content = await response.text();

    const contentType = parseContentType(response);
    const contentLength = parseContentLength(response) ?? 0;

    return {
        content,
        contentType,
        contentLength,
        isMalformed: false
    } as ParsedResponse;
}

async function handleError(response: Response, request: HttpClientRequest) {
    const { correlationId } = request.options;

    if (response.status === 400) {
        const responseType = parseResponseType(response);

        if (responseType === "json") {
            const { content, contentType, contentLength, isMalformed, parsingError } = await parseJsonResponse(response);

            if (isMalformed) {
                return errorResponse(malformedJson(parsingError!, () => content), { response, data: content, contentType, contentLength, correlationId });
            }

            return errorResponse(badRequest(() => content, response), { response, data: content, contentType, contentLength, correlationId });
        } else if (responseType === "unknown") {
            const { content, contentType, contentLength } = await parseUnknownResponseType(response);

            return errorResponse(badRequest(() => content, response), { response, data: content, contentType, contentLength, correlationId });
        }

        // Do not parse response with no content-type.
        return errorResponse(badRequest(() => undefined, response), { response, correlationId });
    } else if (response.status === 401) {
        return errorResponse(unauthorized(response), { response, correlationId });
    } else if (response.status === 403) {
        return errorResponse(forbidden(response), { response, correlationId });
    } else if (response.status === 404) {
        return errorResponse(notFound(response), { response, correlationId });
    } else if (response.status === 409) {
        return errorResponse(concurrencyError(response), { response, correlationId });
    } else if (response.status === 412) {
        return errorResponse(preconditionFailed(response), { response, correlationId });
    } else if (response.status === 429) {
        return errorResponse(tooManyRequest(response), { response, correlationId });
    } else if (response.status === 500) {
        return errorResponse(internalServerError(response), { response, correlationId });
    } else if (response.status === 502) {
        return errorResponse(badGateway(response), { response, correlationId });
    } else if (response.status === 503) {
        return errorResponse(serviceUnavailable(response), { response, correlationId });
    } else if (response.status === 504) {
        return errorResponse(gatewayTimeout(response), { response, correlationId });
    }

    // The status code is not currently handled.
    return errorResponse(requestError(response), { response, correlationId });
}

async function execute(request: HttpClientRequest) {
    const { url, options } = request;

    const {
        correlationId,
        ...fetchOptions
    } = options;

    try {
        const response = await fetchWithTimeout(url, fetchOptions);

        if (response.ok) {
            const responseType = parseResponseType(response);

            if (responseType === "json") {
                const { content, contentType, contentLength, isMalformed, parsingError } = await parseJsonResponse(response);

                if (isMalformed) {
                    return errorResponse(malformedJson(parsingError!, () => content), { response, data: content, contentType, contentLength, correlationId });
                }

                return okResponse(response, { data: content, contentType, contentLength, correlationId });
            } else if (responseType === "unknown") {
                const { content, contentType, contentLength } = await parseUnknownResponseType(response);

                return okResponse(response, { data: content, contentType, contentLength, correlationId });
            }

            // Do not parse response with no content-type.
            return okResponse(response, { correlationId });
        }

        return await handleError(response, request);
    } catch (error: unknown) {
        const typedError = error as Error;

        if (typedError.name === "AbortError") {
            return errorResponse(aborted(), { correlationId });
        } else if (typedError.name === "TimeoutError") {
            return errorResponse(timeout(), { correlationId });
        }

        return errorResponse(networkError(typedError), { correlationId });
    }
}

export type HttpClientOptions = Omit<HttpClientRequestOptions, "body" | "method">;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function httpRequest(url: string, method: HttpMethod, data?: BodyInit, options: HttpClientOptions = {}) {
    const request: HttpClientRequest = {
        url,
        options: {
            ...options,
            method,
            body: data
        }
    };

    return execute(request);
}

export function httpGet(url: string, options?: HttpClientOptions) {
    return httpRequest(url, "GET", undefined, options);
}

export function httpPost(url: string, data?: BodyInit, options?: HttpClientOptions) {
    return httpRequest(url, "POST", data, options);
}

// --- Error types

function requestError(response: Response): HttpClientUnknownError {
    return {
        description: "An error occurred while sending the request.",
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function aborted(): HttpClientKnownError {
    return {
        description: "The request has been aborted.",
        reason: HttpClientErrorReasons.aborted,
        getResponseContent: () => undefined
    };
}

function badGateway(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 502 Bad Gateway.",
        reason: HttpClientErrorReasons.badGateway,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function badRequest(responseTextAccessor: GetResponseContent, response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 400 Bad Request.",
        reason: HttpClientErrorReasons.badRequest,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: responseTextAccessor
    };
}

function concurrencyError(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 409 ConcurrencyError.",
        reason: HttpClientErrorReasons.concurrencyError,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function forbidden(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 403 Forbidden Request.",
        reason: HttpClientErrorReasons.forbidden,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function gatewayTimeout(response: Response): HttpClientKnownError {
    return {
        description: "Server responses with a 504 Gateway Timeout. The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.",
        reason: HttpClientErrorReasons.gatewayTimeout,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function internalServerError(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 500 Internal Server Error.",
        reason: HttpClientErrorReasons.internalServerError,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function malformedJson(innerError: Error, responseTextAccessor: GetResponseContent): HttpClientKnownError {
    return {
        description: `Server responded with a malformed JSON body\nError: ${innerError.toString()}.`,
        reason: HttpClientErrorReasons.malformedJson,
        getResponseContent: responseTextAccessor
    };
}

function networkError(innerError: Error): HttpClientKnownError {
    return {
        description: `Couldn't reach the server\nError: ${innerError.toString()}.`,
        reason: HttpClientErrorReasons.networkError,
        getResponseContent: () => ""
    };
}

function notFound(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 404 Not Found.",
        reason: HttpClientErrorReasons.notFound,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function preconditionFailed(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 412 Precondition Failed.",
        reason: HttpClientErrorReasons.preconditionFailed,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function unauthorized(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 401 Unauthorized Request.",
        reason: HttpClientErrorReasons.unauthorized,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function serviceUnavailable(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 503 Service Unavailable.",
        reason: HttpClientErrorReasons.serviceUnavailable,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}

function timeout(): HttpClientKnownError {
    return {
        description: "The request has timed out.",
        reason: HttpClientErrorReasons.timeout,
        getResponseContent: () => undefined
    };
}

function tooManyRequest(response: Response): HttpClientKnownError {
    return {
        description: "Server responded with a 429 Too Many Requests.",
        reason: HttpClientErrorReasons.tooManyRequests,
        status: response.status,
        statusText: response.statusText,
        getResponseContent: () => response.text()
    };
}
