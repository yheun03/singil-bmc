import {
    seoConfig,
    seoKeywords,
    seoNoindexPrefixes,
    seoStructuredData,
    type SeoLocale,
} from '~/config/seo';
import { getSeoPageDefaults } from '~/config/seo-pages';

/** 동적 페이지가 플러그인 기본 SEO 위에 덮어쓸 때 사용 */
export function useSeoPageState() {
    return useState<Partial<UseSeoOptions> | null>('seo-page-state', () => null);
}

export function setSeoPageOverride(options: Partial<UseSeoOptions> | null) {
    useSeoPageState().value = options;
}

/** schema.org JSON-LD 객체 (페이지별 확장·기본 스키마 공통) */
export type JsonLdSchema = Record<string, unknown>;

export type UseSeoOptions = {
    /** 페이지 제목 (홈·빈 값이면 사이트명만) */
    title?: string;
    description?: string;
    /** 라우트 path (예: /about). canonical·og:url 계산에 사용 */
    path?: string;
    image?: string;
    locale?: SeoLocale;
    type?: 'website' | 'article';
    noindex?: boolean;
    /** 경로 기본값 조회 생략 */
    skipDefaults?: boolean;
    /** article 등 페이지 전용 JSON-LD */
    jsonLd?: JsonLdSchema | JsonLdSchema[] | null;
};

function normalizeSitePath(path: string): string {
    const trimmed = path.trim() || '/';
    if (trimmed === '/') return '/';
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function joinSiteUrl(siteUrl: string, path: string): string {
    const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
    const segment = path === '/' ? '' : path.replace(/^\//, '');
    return segment ? `${base}${segment}` : base;
}

function resolveAbsoluteAssetUrl(relativePath: string, siteUrl: string): string {
    const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    return joinSiteUrl(siteUrl, path);
}

export function formatSeoTitle(pageTitle?: string): string {
    const trimmed = pageTitle?.trim();
    if (!trimmed || trimmed === '홈') {
        return seoConfig.siteName;
    }
    return `${trimmed} · ${seoConfig.siteName}`;
}

export function stripHtmlForSeo(html: string): string {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function shouldSeoNoindex(path: string): boolean {
    return seoNoindexPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function buildOrganizationJsonLd(siteUrl: string, locale: SeoLocale): JsonLdSchema {
    const orgUrl = `${siteUrl}${seoConfig.organizationId}`;
    return {
        '@context': 'https://schema.org',
        '@type': 'SportsTeam',
        '@id': orgUrl,
        name: seoConfig.siteName,
        alternateName: seoStructuredData.organization.alternateName,
        url: siteUrl,
        logo: resolveAbsoluteAssetUrl('/icons/logo.png', siteUrl),
        description: seoStructuredData.organization.description[locale],
        sameAs: [...seoConfig.sameAs],
    };
}

function buildWebsiteJsonLd(siteUrl: string, locale: SeoLocale): JsonLdSchema {
    const websiteUrl = `${siteUrl}${seoConfig.websiteId}`;
    const orgUrl = `${siteUrl}${seoConfig.organizationId}`;
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': websiteUrl,
        url: siteUrl,
        name: seoStructuredData.website.name[locale],
        description: seoStructuredData.website.description[locale],
        inLanguage: locale === 'ko' ? 'ko-KR' : 'en-US',
        publisher: { '@id': orgUrl },
    };
}

/**
 * 페이지·라우트별 SEO 메타와 JSON-LD를 적용한다.
 * 동일 setup에서 여러 번 호출해도 reactive 옵션으로 갱신된다.
 */
export function useSeo(options: MaybeRefOrGetter<UseSeoOptions> = {}) {
    const route = useRoute();
    const pageOverride = useSeoPageState();

    const resolved = computed(() => {
        const input = { ...toValue(options), ...(pageOverride.value ?? {}) };
        const path = normalizeSitePath(input.path ?? route.path);
        const locale = input.locale ?? 'ko';
        const pageDefaults = input.skipDefaults ? { title: undefined, description: '' } : getSeoPageDefaults(path, locale);

        const metaTitle = typeof route.meta.title === 'string' ? route.meta.title : undefined;
        const pageTitle = input.title ?? metaTitle ?? pageDefaults.title;
        const description =
            input.description?.trim() ||
            (typeof route.meta.seoDescription === 'string' ? route.meta.seoDescription : '') ||
            pageDefaults.description ||
            seoStructuredData.website.description[locale];

        const noindex =
            input.noindex ??
            route.meta.seoNoindex ??
            shouldSeoNoindex(path);

        const type = input.type ?? route.meta.seoType ?? 'website';
        const canonicalUrl = joinSiteUrl(seoConfig.siteUrl, path === '/' ? '' : path);
        const title = formatSeoTitle(pageTitle);
        const imagePath = input.image ?? seoConfig.defaultOgImage;
        const imageUrl = resolveAbsoluteAssetUrl(imagePath, seoConfig.siteUrl);
        const keywords = seoKeywords[locale].join(', ');

        const jsonLdBase: JsonLdSchema[] = [
            buildOrganizationJsonLd(seoConfig.siteUrl, locale),
            buildWebsiteJsonLd(seoConfig.siteUrl, locale),
        ];
        const pageJsonLd = input.jsonLd;
        const jsonLdScripts: JsonLdSchema[] = [...jsonLdBase];
        if (pageJsonLd) {
            const extras = Array.isArray(pageJsonLd) ? pageJsonLd : [pageJsonLd];
            jsonLdScripts.push(...extras);
        }

        return {
            path,
            locale,
            title,
            description,
            canonicalUrl,
            imageUrl,
            keywords,
            noindex,
            type,
            jsonLdScripts,
        };
    });

    useHead(
        computed(() => {
            const data = resolved.value;
            const robots = data.noindex ? 'noindex, nofollow' : 'index, follow';
            const ogLocale = data.locale === 'ko' ? 'ko_KR' : 'en_US';

            return {
                title: data.title,
                htmlAttrs: { lang: data.locale === 'ko' ? 'ko' : 'en' },
                link: [{ key: 'canonical', rel: 'canonical', href: data.canonicalUrl }],
                meta: [
                    { key: 'description', name: 'description', content: data.description },
                    { key: 'keywords', name: 'keywords', content: data.keywords },
                    { key: 'robots', name: 'robots', content: robots },
                    { key: 'theme-color', name: 'theme-color', content: seoConfig.themeColor },
                    { key: 'application-name', name: 'application-name', content: seoConfig.siteNameShort },
                    { key: 'og-title', property: 'og:title', content: data.title },
                    { key: 'og-description', property: 'og:description', content: data.description },
                    { key: 'og-type', property: 'og:type', content: data.type },
                    { key: 'og-url', property: 'og:url', content: data.canonicalUrl },
                    { key: 'og-image', property: 'og:image', content: data.imageUrl },
                    {
                        key: 'og-image-width',
                        property: 'og:image:width',
                        content: String(seoConfig.defaultOgImageSize.width),
                    },
                    {
                        key: 'og-image-height',
                        property: 'og:image:height',
                        content: String(seoConfig.defaultOgImageSize.height),
                    },
                    { key: 'og-site-name', property: 'og:site_name', content: seoConfig.siteName },
                    { key: 'og-locale', property: 'og:locale', content: ogLocale },
                    { key: 'twitter-card', name: 'twitter:card', content: 'summary_large_image' },
                    { key: 'twitter-title', name: 'twitter:title', content: data.title },
                    { key: 'twitter-description', name: 'twitter:description', content: data.description },
                    { key: 'twitter-image', name: 'twitter:image', content: data.imageUrl },
                ],
                script: data.jsonLdScripts.map((schema, index) => ({
                    key: `jsonld-${index}`,
                    type: 'application/ld+json',
                    innerHTML: JSON.stringify(schema),
                })),
            };
        }),
    );

    return { resolved };
}

export function buildNewsArticleJsonLd(input: {
    title: string;
    description: string;
    path: string;
    datePublished?: string;
}) {
    const pageUrl = joinSiteUrl(seoConfig.siteUrl, input.path.replace(/^\//, ''));
    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: input.title,
        description: input.description,
        datePublished: input.datePublished,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        publisher: { '@id': `${seoConfig.siteUrl}${seoConfig.organizationId}` },
        inLanguage: 'ko-KR',
    };
}

export function buildSportsEventJsonLd(input: {
    name: string;
    description: string;
    path: string;
    startDate?: string;
}) {
    const pageUrl = joinSiteUrl(seoConfig.siteUrl, input.path.replace(/^\//, ''));
    return {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        url: pageUrl,
        competitor: [
            { '@type': 'SportsTeam', name: seoConfig.siteName },
        ],
        organizer: { '@id': `${seoConfig.siteUrl}${seoConfig.organizationId}` },
    };
}
