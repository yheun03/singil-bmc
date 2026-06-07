<template>
    <SitePageLayout
        eyebrow="RECORDS"
        title="조별 기록"
        description="A조와 D조 기록을 비교합니다."
        :pending="pending"
        :error="error"
    >
        <AppTabs v-model:active-id="selectedGroup" :items="groupTabItems" variant="pill" size="sm" class="bmc-group-tabs" />
        <article v-if="selectedRecord" class="bmc-contact-box">
            <h3 style="margin:0 0 12px;font-size:1.25rem;font-weight:800;">{{ selectedGroup }}조</h3>
            <p style="margin:0 0 6px;">
                경기 {{ selectedRecord.games }} · 안타 {{ selectedRecord.hits }} · 득점 {{ selectedRecord.runs }}
            </p>
            <p style="margin:0;color:#6b7280;">팀 타율 {{ selectedRecord.teamAvg }}</p>
        </article>
    </SitePageLayout>
</template>

<script setup lang="ts">
type GroupRecord = { games: number; hits: number; runs: number; teamAvg: string };
type GroupRecords = Record<string, GroupRecord>;

definePageMeta({ title: '조별 기록' });

const { data: groupRecords, pending, error } = useSiteData<GroupRecords>('summary/group-records.json');
const { allGroupTabItems } = useSeasonTeams();
const groupTabItems = computed(() => allGroupTabItems(false));
const selectedGroup = ref('');
watch(
    groupTabItems,
    (tabs) => {
        if (!selectedGroup.value && tabs.length) {
            selectedGroup.value = tabs[0].id;
        }
    },
    { immediate: true },
);
const selectedRecord = computed(() => groupRecords.value?.[selectedGroup.value] ?? null);
</script>

<style scoped lang="scss">
.bmc-group-tabs {
    margin-bottom: 20px;
}
</style>
