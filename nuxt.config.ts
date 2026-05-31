const APP_BASE = (process.env.NUXT_APP_BASE_URL || '/singil-bmc/').replace(/\/?$/, '/');

export default defineNuxtConfig({
    compatibilityDate: '2026-05-31',
    devtools: { enabled: true },
    experimental: { appManifest: false },
    features: { inlineStyles: false },

    app: {
        // GitHub Pages: https://yheun03.github.io/singil-bmc/
        // 다른 base는 빌드 시 NUXT_APP_BASE_URL 로 지정 (package.json의 generate:gh-pages).
        baseURL: APP_BASE,
        head: {
            title: '신길교회 야구 선교단',
            htmlAttrs: { lang: 'ko' },
            link: [{ rel: 'icon', type: 'image/svg+xml', href: `${APP_BASE}favicon.svg` }],
        },
    },

    site: {
        url: 'https://yheun03.github.io/singil-bmc',
        name: '신길교회 야구 선교단',
    },

    modules: ['@pinia/nuxt'],
    css: [
        // AG Grid 테마 CSS는 전역 link 로드로 고정 (dev 인라인 주입 최소화)
        'ag-grid-community/styles/ag-theme-quartz.css',
        '~/assets/scss/main.scss',
    ],

    components: [
        { path: '~/components/Table', pathPrefix: false },
        { path: '~/components/Section', pathPrefix: false },
        { path: '~/components/Layout', pathPrefix: false },
        { path: '~/components/Site', pathPrefix: false },
        { path: '~/components/Modal', pathPrefix: false },
        // 모든 전역 컴포넌트를 components 루트에서 자동 등록
        { path: '~/components', pathPrefix: true },
    ],

    // 플러그인 실행 순서를 명확히 하기 위해 명시 로딩
    plugins: [
        '~/plugins/preferences.client',
        '~/plugins/axios',
        '~/plugins/iconify',
        '~/plugins/ag-grid.client',
        '~/plugins/route-tabs.client',
        '~/plugins/global-css-no-inline.client',
    ],

    devServer: {
        port: 3000,
    },

    vite: {
        build: {
            cssCodeSplit: false,
        },
        server: {
            watch: {
                usePolling: true,
                interval: 250,
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    loadPaths: ['assets/scss'],
                    additionalData: `@use "abstract/index" as *;`,
                },
            },
        },
    },

    // macOS 등에서 fs watcher 한도(EMFILE) 이슈 완화
    watchers: {
        chokidar: {
            usePolling: true,
            interval: 250,
        },
    },

    runtimeConfig: {
        public: {
            apiBase: '/api',
            appBase: APP_BASE,
        },
    },

    // GitHub Pages 배포 대응
    nitro: {
        preset: 'static',
    },

    hooks: {
        'pages:extend'(pages) {
            const frameworkPrefixes = ['/demos', '/auth', '/workspace', '/settings'];

            for (const page of pages) {
                if (!page.path || frameworkPrefixes.some((prefix) => page.path?.startsWith(prefix))) {
                    continue;
                }

                page.meta ||= {};
                if (!page.meta.layout) {
                    page.meta.layout = 'site';
                }
            }
        },
    },
});
