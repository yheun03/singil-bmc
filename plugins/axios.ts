import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { getRequestURL } from 'h3';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const event = useRequestEvent();
    const requestUrl = event ? getRequestURL(event) : null;
    const apiBase = config.public.apiBase as string;
    const baseURL = import.meta.client
        ? apiBase
        : apiBase.startsWith('http')
          ? apiBase
          : `${requestUrl?.origin ?? 'http://localhost'}${apiBase.startsWith('/') ? apiBase : `/${apiBase}`}`;

    const api: AxiosInstance = axios.create({
        baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
    });

    api.interceptors.request.use(
        (req) => req,
        (error) => Promise.reject(error),
    );

    api.interceptors.response.use(
        (res) => res,
        (error) => Promise.reject(error),
    );

    return {
        provide: { api },
    };
});
