<template>
    <SitePageLayout
        eyebrow="RECORDS"
        title="월별 기록"
        description="월별 누적 기록을 타자·투수로 나누어 확인합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-record-controls">
            <label class="bmc-record-period">
                <span class="bmc-record-period__label">기간</span>
                <select v-model="selectedKey" class="bmc-record-period__select" :disabled="!monthOptions.length">
                    <option v-if="!monthOptions.length" disabled value="">월 선택</option>
                    <option v-for="item in monthOptions" :key="item.value" :value="item.value">
                        {{ item.label }}
                    </option>
                </select>
            </label>
            <div class="bmc-segmented" role="tablist" aria-label="기록 유형">
                <button type="button" :class="{ 'is-active': activeTab === 'batting' }" @click="activeTab = 'batting'">
                    타자
                </button>
                <button type="button" :class="{ 'is-active': activeTab === 'pitching' }" @click="activeTab = 'pitching'">
                    투수
                </button>
            </div>
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
            <h3 class="bmc-record-grid__title">
                {{ selectedRecord?.year }}년 {{ selectedRecord?.month }}월 {{ activeTab === 'batting' ? '타자' : '투수' }} 기록
            </h3>
            <ClientOnly>
                <AppGrid
                    grid-id="monthly-record-grid"
                    class="bmc-record-grid__grid ag-theme-quartz"
                    :row-data="gridRows"
                    :column-defs="gridColumns"
                    :default-col-def="defaultColDef"
                    :style="{ height: gridHeight(gridRows.length), width: '100%' }"
                />
            </ClientOnly>
        </section>
    </SitePageLayout>
</template>

<script setup lang="ts">
import type { ColDef } from 'ag-grid-community';
import { buildPeriodRecordView, type PeriodRecordSlice } from '~/utils/record-aggregate';

type MonthlyRecord = PeriodRecordSlice & {
    key: string;
    year: number;
    month: number;
};

definePageMeta({ title: '월별 기록' });

const { data, pending, error } = useSiteData<MonthlyRecord[]>('summary/monthly-records.json');
const monthlyRecords = computed(() => data.value ?? []);
const selectedKey = ref('');
const selectedGroup = ref('all');
const activeTab = ref<'batting' | 'pitching'>('batting');
const { tabItemsForYear } = useSeasonTeams();

const monthOptions = computed(() =>
    monthlyRecords.value.map((item) => ({
        label: `${item.year}년 ${item.month}월`,
        value: item.key,
    })),
);
const selectedRecord = computed(() => monthlyRecords.value.find((item) => item.key === selectedKey.value) ?? null);
const groupTabItems = computed(() =>
    tabItemsForYear(selectedRecord.value?.year ?? new Date().getFullYear()),
);

watchEffect(() => {
    if (!selectedKey.value && monthlyRecords.value.length) {
        selectedKey.value = monthlyRecords.value[0].key;
    }
});

watch(
    () => selectedRecord.value?.year,
    () => {
        selectedGroup.value = 'all';
    },
);

const displayRecord = computed(() => buildPeriodRecordView(selectedRecord.value, selectedGroup.value));
const showGroupColumn = computed(() => selectedGroup.value !== 'all');
const gridRows = computed(() => displayRecord.value?.[activeTab.value] ?? []);

const defaultColDef: ColDef = { flex: 1, minWidth: 76, sortable: true, filter: true, resizable: true };
const battingColumnsBase: ColDef[] = [
    { field: 'name', headerName: '이름', minWidth: 96 },
    { field: 'g', headerName: 'G', width: 72 },
    { field: 'avg', headerName: 'AVG', width: 88, sort: 'desc', sortIndex: 0 },
    { field: 'h', headerName: 'H', width: 72 },
    { field: 'rbi', headerName: 'RBI', width: 80 },
    { field: 'r', headerName: 'R', width: 72 },
    { field: 'sb', headerName: 'SB', width: 72 },
];
const pitchingColumnsBase: ColDef[] = [
    { field: 'name', headerName: '이름', minWidth: 96 },
    { field: 'g', headerName: 'G', width: 72 },
    { field: 'ip', headerName: 'IP', width: 80 },
    { field: 'era', headerName: 'ERA', width: 88, sort: 'asc', sortIndex: 0 },
    { field: 'so', headerName: 'SO', width: 72 },
    { field: 'win', headerName: 'W', width: 72 },
    { field: 'whip', headerName: 'WHIP', width: 88 },
];
const groupColumn: ColDef = { field: 'group', headerName: '조', width: 72 };
const battingColumns = computed(() =>
    showGroupColumn.value ? [battingColumnsBase[0], groupColumn, ...battingColumnsBase.slice(1)] : battingColumnsBase,
);
const pitchingColumns = computed(() =>
    showGroupColumn.value ? [pitchingColumnsBase[0], groupColumn, ...pitchingColumnsBase.slice(1)] : pitchingColumnsBase,
);
const gridColumns = computed(() => (activeTab.value === 'batting' ? battingColumns.value : pitchingColumns.value));

function gridHeight(rowCount: number) {
    return `${Math.min(Math.max(Math.max(rowCount, 1) * 42 + 48, 220), 560)}px`;
}
</script>

<style scoped lang="scss">
@use "~/assets/scss/pages/records" as *;

.bmc-record-controls {
    @include bmc-record-controls;
}

.bmc-record-period {
    @include bmc-record-period;
}

.bmc-record-summary {
    @include bmc-record-summary;
}

.bmc-record-tabs {
    @include bmc-record-tabs;
}

.bmc-segmented {
    @include bmc-segmented;
}

.bmc-record-grid__title {
    @include bmc-record-grid-title;
}
</style>
