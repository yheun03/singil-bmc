<template>
    <SitePageLayout
        eyebrow="RECORDS"
        title="월별 기록"
        description="월별 경기 및 기록을 확인합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--2">
            <article
                v-for="item in monthlyRecords"
                :key="`${item.year}-${item.month}`"
                class="bmc-stat-card"
                style="text-align:left;"
            >
                <strong style="font-size:1.25rem;">{{ item.year }}년 {{ item.month }}월</strong>
                <span>경기 {{ item.games }} · 안타 {{ item.hits }} · 득점 {{ item.runs }}</span>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type MonthlyRecord = { year: number; month: number; games: number; hits: number; runs: number };

definePageMeta({ title: '월별 기록' });

const { data: monthlyRecords, pending, error } = useSiteData<MonthlyRecord[]>('summary/monthly-records.json');
</script>
