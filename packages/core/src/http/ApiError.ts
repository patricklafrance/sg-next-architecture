import type { GetResponseContent, HttpClientErrorReason, HttpClientResponse } from "./httpClient.ts";

export interface ApiErrorData {
    code: string;
    message?: string;
}

export class ApiError extends Error {
    readonly #status?: number;
    readonly #statusText?: string;
    readonly #reason?: HttpClientErrorReason;
    readonly #description?: string;
    readonly #getResponseContent: GetResponseContent;
    readonly #data?: ApiErrorData;
    readonly #headers?: Headers;
    readonly #correlationId?: string;

    constructor({ error, data, headers, correlationId }: HttpClientResponse) {
        const { status, statusText, reason, description, getResponseContent } = error!;

        const message = `Status: ${status ?? statusText}\nDescription: ${description ?? reason}\nData: ${data ? JSON.stringify(data) : "-"}\nCorrelationId: ${correlationId ?? "-"}`;

        super(message);

        this.#status = status;
        this.#statusText = statusText;
        this.#reason = reason;
        this.#description = description;
        this.#getResponseContent = getResponseContent;
        this.#data = data as ApiErrorData;
        this.#headers = headers;
        this.#correlationId = correlationId;
    }

    get status() {
        return this.#status;
    }

    get statusText() {
        return this.#statusText;
    }

    get reason() {
        return this.#reason;
    }

    get description() {
        return this.#description;
    }

    getResponseContent() {
        return this.#getResponseContent();
    }

    get data() {
        return this.#data;
    }

    get headers() {
        return this.#headers;
    }

    get correlationId() {
        return this.#correlationId;
    }
}

export function isApiError(error?: unknown): error is ApiError {
    return error !== undefined && error !== null && error instanceof ApiError;
}
