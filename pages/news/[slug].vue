<template>
    <SitePageLayout
        eyebrow="NEWS"
        :title="article?.title ?? '소식'"
        :description="article?.date"
        :pending="pending"
        :error="error || (!article && !pending ? '해당 소식을 찾을 수 없습니다.' : '')"
    >
        <article v-if="article" class="bmc-about-intro">
            <div class="bmc-news-card__body" v-html="article.content" />
        </article>
    </SitePageLayout>
</template>

<script setup lang="ts">
type NewsItem = { slug: string; title: string; date: string; content: string };

definePageMeta({ title: '소식 상세' });

const route = useRoute();
const { fetchJson } = useBasePath();
const article = ref<NewsItem | null>(null);
const pending = ref(true);
const error = ref('');

onMounted(async () => {
    try {
        const items = await fetchJson<NewsItem[]>('meta/news.json');
        const slug = String(route.params.slug);
        article.value = items.find((item) => item.slug === slug) ?? null;
    } catch (err) {
        error.value = err instanceof Error ? err.message : '소식 데이터를 불러오지 못했습니다.';
    } finally {
        pending.value = false;
    }
});

watch(
    article,
    (item) => {
        if (!item) {
            setSeoPageOverride(null);
            return;
        }

        const path = `/news/${item.slug}`;
        const description =
            stripHtmlForSeo(item.content).slice(0, 160) || `${item.title} — 신길교회 야구 선교단 소식`;

        setSeoPageOverride({
            title: item.title,
            description,
            path,
            type: 'article',
            jsonLd: buildNewsArticleJsonLd({
                title: item.title,
                description,
                path,
                datePublished: item.date,
            }),
        });
    },
    { immediate: true },
);

onUnmounted(() => setSeoPageOverride(null));
</script>

<style scoped>
:deep(.bmc-news-card__body) {
    line-height: 1.75;
    color: #1f2937;
}
</style>
