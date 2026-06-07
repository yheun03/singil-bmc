export type SeoPageMeta = {
    /** useSeo에 넘길 페이지 전용 설명 (definePageMeta.title과 별도) */
    seoDescription?: string;
    /** true면 robots noindex */
    seoNoindex?: boolean;
    /** article 등 Open Graph type */
    seoType?: 'website' | 'article';
};

declare module '#app' {
    interface PageMeta extends SeoPageMeta {}
}

declare module 'vue-router' {
    interface RouteMeta extends SeoPageMeta {}
}

export {};
