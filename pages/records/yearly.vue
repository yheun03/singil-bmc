<template>
    <SitePageLayout
        eyebrow="RECORDS"
        title="연도별 기록"
        description="시즌 전체 누적 타자·투수 기록을 확인합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-record-controls">
            <button
                v-for="item in yearlyRecords"
                :key="item.year"
                class="bmc-chip"
                :class="{ 'is-active': selectedYear === item.year }"
                type="button"
                @click="selectedYear = item.year"
            >
                {{ item.year }}년
            </button>
        </div>

        <AppTabs v-model:active-id="selectedGroup" :items="groupTabItems" variant="pill" size="sm" class="bmc-record-tabs" />

        <div v-if="displayRecord" class="bmc-grid bmc-grid--3 bmc-record-summary">
            <article class="bmc-stat-card">
                <strong>{{ displayRecord.games }}</strong>
                <span>경기</span>
            </article>
            <article class="bmc-stat-card">
                <strong>{{ displayRecord.hits }}</strong>
                <span>안타</span>
            </article>
            <article class="bmc-stat-card">
                <strong>{{ displayRecord.runs }}</strong>
                <span>득점</span>
            </article>
        </div>

        <section class="bmc-record-grid">
            <h3 class="bmc-record-grid__title">타자 기록</h3>
            <ClientOnly>
                <AppGrid
                    grid-id="yearly-batting-grid"
                    class="bmc-record-grid__grid ag-theme-quartz"
                    :row-data="displayRecord?.batting ?? []"
                    :column-defs="battingColumns"
                    :default-col-def="defaultColDef"
                    :style="{ height: gridHeight(displayRecord?.batting?.length ?? 0), width: '100%' }"
                />
            </ClientOnly>
        </section>

        <section class="bmc-record-grid">
            <h3 class="bmc-record-grid__title">투수 기록</h3>
            <ClientOnly>
                <AppGrid
                    grid-id="yearly-pitching-grid"
                    class="bmc-record-grid__grid ag-theme-quartz"
                    :row-data="displayRecord?.pitching ?? []"
                    :column-defs="pitchingColumns"
                    :default-col-def="defaultColDef"
                    :style="{ height: gridHeight(displayRecord?.pitching?.length ?? 0), width: '100%' }"
                />
            </ClientOnly>
        </section>
    </SitePageLayout>
</template>

<script setup lang="ts">
import type { ColDef } from 'ag-grid-community';

type StatRow = Record<string, string | number>;
type PeriodGroupRecord = {
    games: number;
    hits: number;
    runs: number;
    batting: StatRow[];
    pitching: StatRow[];
};
type YearlyRecord = {
    year: number;
    games: number;
    hits: number;
    runs: number;
    batting: StatRow[];
    pitching: StatRow[];
    groups?: Record<string, PeriodGroupRecord>;
};

definePageMeta({ title: '연도별 기록' });

const { data, pending, error } = useSiteData<YearlyRecord[]>('summary/yearly-records.json');
const yearlyRecords = computed(() => data.value ?? []);
const selectedYear = ref<number | null>(null);
const selectedGroup = ref('all');
const groupTabItems = [
    { id: 'all', title: '전체', bodyRenderer: () => null },
    { id: 'A', title: 'A조', bodyRenderer: () => null },
    { id: 'D', title: 'D조', bodyRenderer: () => null },
];

watchEffect(() => {
    if (!selectedYear.value && yearlyRecords.value.length) {
        selectedYear.value = yearlyRecords.value[0].year;
    }
});

const selectedRecord = computed(() => yearlyRecords.value.find((item) => item.year === selectedYear.value) ?? null);
const displayRecord = computed(() => {
    if (!selectedRecord.value || selectedGroup.value === 'all') {
        return selectedRecord.value;
    }

    return selectedRecord.value.groups?.[selectedGroup.value] ?? null;
});

const defaultColDef: ColDef = { flex: 1, minWidth: 76, sortable: true, filter: true, resizable: true };
const battingColumns: ColDef[] = [
    { field: 'name', headerName: '이름', minWidth: 96 },
    { field: 'group', headerName: '조', width: 72 },
    { field: 'g', headerName: 'G', width: 72 },
    { field: 'avg', headerName: 'AVG', width: 88 },
    { field: 'h', headerName: 'H', width: 72 },
    { field: 'rbi', headerName: 'RBI', width: 80 },
    { field: 'r', headerName: 'R', width: 72 },
    { field: 'sb', headerName: 'SB', width: 72 },
];
const pitchingColumns: ColDef[] = [
    { field: 'name', headerName: '이름', minWidth: 96 },
    { field: 'group', headerName: '조', width: 72 },
    { field: 'g', headerName: 'G', width: 72 },
    { field: 'ip', headerName: 'IP', width: 80 },
    { field: 'era', headerName: 'ERA', width: 88 },
    { field: 'so', headerName: 'SO', width: 72 },
    { field: 'win', headerName: 'W', width: 72 },
    { field: 'whip', headerName: 'WHIP', width: 88 },
];

function gridHeight(rowCount: number) {
    return `${Math.min(Math.max(Math.max(rowCount, 1) * 42 + 48, 220), 560)}px`;
}
</script>

<style scoped lang="scss">
.bmc-record-controls,
.bmc-record-summary {
    margin-bottom: 20px;
}

.bmc-record-tabs {
    margin-bottom: 20px;
}

.bmc-record-grid + .bmc-record-grid {
    margin-top: 28px;
}

.bmc-record-grid__title {
    margin: 0 0 12px;
    font-size: 1.125rem;
    font-weight: 800;
}
</style>
