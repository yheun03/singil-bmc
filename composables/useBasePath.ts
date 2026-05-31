const DEFAULT_BASE = '/singil-bmc/';

/**
 * GitHub Pages 하위 경로(/singil-bmc/) 기준 정적 자산·JSON 경로 유틸
 *
 * import.meta.env.BASE_URL 은 dev 클라이언트에서 /_nuxt/ 로 잡히는 경우가 있어
 * runtimeConfig.app.baseURL 만 사용합니다.
 */
export function useBasePath() {
    const config = useRuntimeConfig();

    function resolveBase(): string {
        const configured = String(config.app.baseURL || config.public.appBase || DEFAULT_BASE);

        let base = configured.includes('_nuxt') ? DEFAULT_BASE : configured;

        if (!base.startsWith('/')) {
            base = `/${base}`;
        }

        if (!base.endsWith('/')) {
            base = `${base}/`;
        }

        return base;
    }

    function joinPath(...segments: string[]): string {
        const joined = segments
            .filter(Boolean)
            .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
            .join('/');

        const full = `${resolveBase()}${joined}`.replace(/\/{2,}/g, '/');
        return full.startsWith('/') ? full : `/${full}`;
    }

    function getDataPath(relativePath: string): string {
        const path = relativePath.replace(/^\//, '');
        return joinPath(path.startsWith('data/') ? path : `data/${path}`);
    }

    function getAssetPath(relativePath: string): string {
        return joinPath(relativePath.replace(/^\//, ''));
    }

    function toAbsoluteUrl(path: string): string {
        if (import.meta.client) {
            return new URL(path, window.location.origin).href;
        }

        return path;
    }

    async function fetchJson<T>(relativePath: string): Promise<T> {
        const path = getDataPath(relativePath);
        const url = toAbsoluteUrl(path);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    return {
        base: computed(() => resolveBase()),
        joinPath,
        getDataPath,
        getAssetPath,
        fetchJson,
    };
}
