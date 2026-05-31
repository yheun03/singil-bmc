import type { AxiosRequestConfig } from 'axios';

type RequestConfig = AxiosRequestConfig;
type FetchResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream';

function isServerLocalRequest(url: string): boolean {
    return Boolean(import.meta.server && url.startsWith('/'));
}

function toAxiosUrl(url: string): string {
    if (url === '/api') return '/';
    if (url.startsWith('/api/')) return url.slice(4);
    return url;
}

function toFetchOptions(config?: RequestConfig) {
    if (!config) return {};
    return {
        headers: config.headers as HeadersInit | undefined,
        params: config.params as Record<string, string | number | boolean> | undefined,
        responseType: config.responseType as FetchResponseType | undefined,
    };
}

export function useApi() {
    const { $api } = useNuxtApp();

    async function get<T>(url: string, config?: RequestConfig): Promise<T> {
        if (isServerLocalRequest(url)) {
            const response = await $fetch(url, {
                method: 'GET',
                ...toFetchOptions(config),
            });
            return response as T;
        }
        const { data } = await $api.get<T>(toAxiosUrl(url), config);
        return data;
    }

    async function post<T, B = Record<string, unknown> | BodyInit | null>(url: string, body?: B, config?: RequestConfig): Promise<T> {
        if (isServerLocalRequest(url)) {
            const response = await $fetch(url, {
                method: 'POST',
                body: body as BodyInit | Record<string, unknown> | null | undefined,
                ...toFetchOptions(config),
            });
            return response as T;
        }
        const { data } = await $api.post<T>(toAxiosUrl(url), body, config);
        return data;
    }

    async function put<T, B = Record<string, unknown> | BodyInit | null>(url: string, body?: B, config?: RequestConfig): Promise<T> {
        if (isServerLocalRequest(url)) {
            const response = await $fetch(url, {
                method: 'PUT',
                body: body as BodyInit | Record<string, unknown> | null | undefined,
                ...toFetchOptions(config),
            });
            return response as T;
        }
        const { data } = await $api.put<T>(toAxiosUrl(url), body, config);
        return data;
    }

    async function remove<T>(url: string, config?: RequestConfig): Promise<T> {
        if (isServerLocalRequest(url)) {
            const response = await $fetch(url, {
                method: 'DELETE',
                ...toFetchOptions(config),
            });
            return response as T;
        }
        const { data } = await $api.delete<T>(toAxiosUrl(url), config);
        return data;
    }

    return {
        get,
        post,
        put,
        delete: remove,
    };
}
