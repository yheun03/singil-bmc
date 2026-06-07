const DEFAULT_BASE = '/singil-bmc/';

function normalizeBasePath(value: string): string {
    let base = String(value ?? '').trim();

    if (!base || base === '/') {
        return '';
    }

    if (base.includes('_nuxt')) {
        return '';
    }

    if (!base.startsWith('/')) {
        base = `/${base}`;
    }

    if (!base.endsWith('/')) {
        base = `${base}/`;
    }

    return base;
}

/**
 * GitHub Pages 하위 경로(/singil-bmc/) 기준 정적 자산·JSON 경로 유틸
 *
 * import.meta.env.BASE_URL 은 dev 클라이언트에서 /_nuxt/ 로 잡히는 경우가 있어 사용하지 않습니다.
 * runtimeConfig.app.baseURL 은 기본값 '/' 로 남는 경우가 있어 public.appBase 를 우선합니다.
 */
export function useBasePath() {
    const config = useRuntimeConfig();
    const router = import.meta.client ? useRouter() : null;

    function resolveBase(): string {
        const fromRouter = normalizeBasePath(router?.options.history.base ?? '');
        const fromPublic = normalizeBasePath(String(config.public.appBase ?? ''));
        const fromRuntime = normalizeBasePath(String(config.app.baseURL ?? ''));

        return fromRouter || fromPublic || fromRuntime || DEFAULT_BASE;
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
