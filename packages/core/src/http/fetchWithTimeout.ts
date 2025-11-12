export interface FetchWithTimeoutOptions extends RequestInit {
    timeoutInMs?: number;
}

export function fetchWithTimeout(url: RequestInfo, { timeoutInMs, signal, ...options }: FetchWithTimeoutOptions = {}) {
    let requestSignal: AbortSignal | undefined | null = signal;

    if (timeoutInMs && timeoutInMs > 0) {
        const timeoutSignal = AbortSignal.timeout(timeoutInMs);

        if (signal) {
            requestSignal = AbortSignal.any([timeoutSignal, signal]);
        } else {
            requestSignal = timeoutSignal;
        }
    }

    return fetch(url, {
        ...options,
        signal: requestSignal
    });
}
