<template>
    <SitePageLayout
        eyebrow="RECORDS"
        title="조별 기록"
        description="A조와 D조 기록을 비교합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--2">
            <article v-for="(group, key) in groupRecords" :key="key" class="bmc-contact-box">
                <h3 style="margin:0 0 12px;font-size:1.25rem;font-weight:800;">{{ key }}조</h3>
                <p style="margin:0 0 6px;">경기 {{ group.games }} · 안타 {{ group.hits }} · 득점 {{ group.runs }}</p>
                <p style="margin:0;color:#6b7280;">팀 타율 {{ group.teamAvg }}</p>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type GroupRecord = { games: number; hits: number; runs: number; teamAvg: string };
type GroupRecords = Record<string, GroupRecord>;

definePageMeta({ title: '조별 기록' });

const { data: groupRecords, pending, error } = useSiteData<GroupRecords>('summary/group-records.json');
</script>
