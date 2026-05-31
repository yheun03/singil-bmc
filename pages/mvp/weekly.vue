<template>
    <SitePageLayout
        eyebrow="MVP"
        title="주간 MVP"
        description="주간 MVP 수상자를 소개합니다."
        :pending="pending"
        :error="error"
    >
        <AppTabs v-model:active-id="selectedGroup" :items="groupTabItems" variant="pill" size="sm" class="bmc-mvp-tabs" />
        <aside class="bmc-mvp-note">
            주간 MVP는 월요일 시작 주차와 조를 기준으로 타자/투수를 나누어 3위까지 자동 산정합니다.
            타자는 안타, 타점, 득점, 도루, 홈런을 반영하고 투수는 아웃카운트, 탈삼진, 승, 세이브, 자책점을 반영합니다.
        </aside>
        <div class="bmc-grid bmc-grid--2">
            <article v-for="item in filteredMvpList" :key="item.id" class="bmc-mvp-card">
                <span class="bmc-mvp-card__badge">{{ item.title }}</span>
                <h3 style="margin:0;font-size:1.125rem;font-weight:800;">{{ item.name }} ({{ item.group }}조)</h3>
                <p style="margin:0;color:#6b7280;line-height:1.6;">{{ item.summary }}</p>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type WeeklyMvp = { id: string; title: string; name: string; group: string; rank: number; summary: string };

definePageMeta({ title: '주간 MVP' });

const { data: mvpList, pending, error } = useSiteData<WeeklyMvp[]>('summary/mvp-weekly.json');
const selectedGroup = ref('all');
const groupTabItems = [
    { id: 'all', title: '전체', bodyRenderer: () => null },
    { id: 'A', title: 'A조', bodyRenderer: () => null },
    { id: 'D', title: 'D조', bodyRenderer: () => null },
];
const filteredMvpList = computed(() =>
    (mvpList.value ?? []).filter((item) => selectedGroup.value === 'all' || item.group === selectedGroup.value),
);
</script>

<style scoped lang="scss">
.bmc-mvp-tabs,
.bmc-mvp-note {
    margin-bottom: 20px;
}

.bmc-mvp-note {
    padding: 16px;
    border: 1px solid #d8dee9;
    border-radius: 8px;
    background: #fff;
    color: #4b5563;
    line-height: 1.65;
}
</style>
