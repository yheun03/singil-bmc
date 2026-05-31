<template>
    <SitePageLayout
        eyebrow="NEWS"
        title="소식"
        description="선교단 소식과 공지"
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--2">
            <NuxtLink
                v-for="item in news"
                :key="item.slug"
                class="bmc-news-card"
                :to="`/news/${item.slug}`"
                style="text-decoration:none;color:inherit;"
            >
                <p style="margin:0;font-size:0.8125rem;font-weight:700;color:#1e56c8;">{{ item.date }}</p>
                <h3 style="margin:0;font-size:1rem;font-weight:800;">{{ item.title }}</h3>
                <p style="margin:0;color:#6b7280;line-height:1.55;">{{ item.summary }}</p>
            </NuxtLink>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type NewsItem = { slug: string; title: string; date: string; summary: string };

definePageMeta({ title: '소식' });

const { data: news, pending, error } = useSiteData<NewsItem[]>('meta/news.json');
</script>
