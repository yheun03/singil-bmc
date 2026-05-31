<template>
    <SitePageLayout
        eyebrow="RECORDS"
        title="연도별 기록"
        description="연도별 누적 기록을 확인합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--2">
            <article v-for="item in yearlyRecords" :key="item.year" class="bmc-stat-card" style="text-align:left;">
                <strong style="font-size:1.5rem;">{{ item.year }}년</strong>
                <span>경기 {{ item.games }} · 안타 {{ item.hits }} · 득점 {{ item.runs }}</span>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type YearlyRecord = { year: number; games: number; hits: number; runs: number };

definePageMeta({ title: '연도별 기록' });

const { data: yearlyRecords, pending, error } = useSiteData<YearlyRecord[]>('summary/yearly-records.json');
</script>
