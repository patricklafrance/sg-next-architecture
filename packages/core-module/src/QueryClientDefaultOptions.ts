import type { DefaultOptions } from "@tanstack/react-query";
import type { ApiError } from "../../core/src/http/ApiError.ts";
import { ApiRateLimitedRetryDelayUnitInMs, ApiRetryDelayInMs } from "../../core/src/http/apiClient.ts";

const MaxRetryCount = 3;

type RetryFunction = NonNullable<DefaultOptions["queries"]>["retry"];
type RetryDelayFunction = NonNullable<DefaultOptions["queries"]>["retryDelay"];

const retry: RetryFunction = (failureCount, error) => {
    if (failureCount > MaxRetryCount) {
        return false;
    }

    const apiError = error as ApiError;

    if (apiError.reason === "Aborted" || apiError.reason === "Timeout") {
        return false;
    }

    // The endpoint provided a retry delay.
    const retryAfter = apiError.headers?.get("Retry-After");

    return !!retryAfter ||
        // The request has been rate limited.
        apiError.status === 429 ||
        apiError.reason === "NetworkError";
};

const retryDelay: RetryDelayFunction = (failureCount, error) => {
    const apiError = error as ApiError;

    // The endpoint provided a retry delay.
    const retryAfter = apiError.headers?.get("Retry-After");

    // The endpoint provided a retry delay.
    if (retryAfter) {
        try {
            return parseInt(retryAfter);
        } catch {
            return ApiRetryDelayInMs;
        }
    }

    // The request has been rate limited, wait and try again.
    if (apiError.status === 429) {
        return (failureCount + 1) * ApiRateLimitedRetryDelayUnitInMs;
    }

    return ApiRetryDelayInMs;
};

export const QueryClientDefaultOptions: DefaultOptions = {
    queries: {
        // 5 minutes.
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry,
        retryDelay
    },
    mutations: {
        retry,
        retryDelay
    }
};
