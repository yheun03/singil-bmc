<template>
    <SitePageLayout
        eyebrow="MVP"
        title="월별 MVP"
        description="월별 MVP 수상자를 소개합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--2">
            <article v-for="item in mvpList" :key="item.id" class="bmc-mvp-card">
                <span class="bmc-mvp-card__badge">{{ item.title }}</span>
                <h3 style="margin:0;font-size:1.125rem;font-weight:800;">{{ item.name }} ({{ item.group }}조)</h3>
                <p style="margin:0;color:#6b7280;line-height:1.6;">{{ item.summary }}</p>
                <p v-if="item.stats" style="margin:0;font-size:0.875rem;font-weight:700;color:#1e56c8;">
                    AVG {{ item.stats.avg }} · H {{ item.stats.h }} · RBI {{ item.stats.rbi }}
                </p>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type MonthlyMvp = {
    id: string;
    title: string;
    name: string;
    group: string;
    summary: string;
    stats?: { avg: string; h: number; rbi: number };
};

definePageMeta({ title: '월별 MVP' });

const { data: mvpList, pending, error } = useSiteData<MonthlyMvp[]>('summary/mvp-monthly.json');
</script>
