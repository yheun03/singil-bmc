<template>
    <SitePageLayout
        eyebrow="HISTORY"
        title="히스토리"
        description="신길교회 야구 선교단의 주요 연혁입니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-timeline">
            <article v-for="(item, index) in history || []" :key="`${item.year}-${item.month}-${index}`" class="bmc-timeline__item">
                <p class="bmc-timeline__date">{{ item.year }}.{{ item.month }}</p>
                <h3 class="bmc-timeline__title">{{ item.title }}</h3>
                <p class="bmc-timeline__desc">{{ item.description }}</p>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type HistoryItem = {
    year: number;
    month: string;
    title: string;
    description: string;
};

definePageMeta({ title: '히스토리' });

const { data: history, pending, error } = useSiteData<HistoryItem[]>('meta/history.json');
</script>
