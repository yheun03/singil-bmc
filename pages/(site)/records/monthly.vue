<template>
    <SitePageLayout
        eyebrow="RECORDS"
        title="월별 기록"
        description="월별 누적 기록을 타자·투수로 나누어 확인합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-record-controls">
            <AppSelect v-model="selectedKey" :options="monthOptions" placeholder="월 선택" />
            <div class="bmc-segmented" role="tablist" aria-label="기록 유형">
                <button type="button" :class="{ 'is-active': activeTab === 'batting' }" @click="activeTab = 'batting'">
                    타자
                </button>
                <button type="button" :class="{ 'is-active': activeTab === 'pitching' }" @click="activeTab = 'pitching'">
                    투수
                </button>
            </div>
        </div>

        <div v-if="selectedRecord" class="bmc-grid bmc-grid--3 bmc-record-summary">
            <article class="bmc-stat-card">
                <strong>{{ selectedRecord.games }}</strong>
                <span>경기</span>
            </article>
            <article class="bmc-stat-card">
                <strong>{{ selectedRecord.hits }}</strong>
                <span>안타</span>
            </article>
            <article class="bmc-stat-card">
                <strong>{{ selectedRecord.runs }}</strong>
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

type StatRow = Record<string, string | number>;
type MonthlyRecord = {
    key: string;
    year: number;
    month: number;
    games: number;
    hits: number;
    runs: number;
    batting: StatRow[];
    pitching: StatRow[];
};

definePageMeta({ title: '월별 기록' });

const { data, pending, error } = useSiteData<MonthlyRecord[]>('summary/monthly-records.json');
const monthlyRecords = computed(() => data.value ?? []);
const selectedKey = ref('');
const activeTab = ref<'batting' | 'pitching'>('batting');

watchEffect(() => {
    if (!selectedKey.value && monthlyRecords.value.length) {
        selectedKey.value = monthlyRecords.value[0].key;
    }
});

const monthOptions = computed(() =>
    monthlyRecords.value.map((item) => ({
        label: `${item.year}년 ${item.month}월`,
        value: item.key,
    })),
);
const selectedRecord = computed(() => monthlyRecords.value.find((item) => item.key === selectedKey.value) ?? null);
const gridRows = computed(() => selectedRecord.value?.[activeTab.value] ?? []);

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
const gridColumns = computed(() => (activeTab.value === 'batting' ? battingColumns : pitchingColumns));

function gridHeight(rowCount: number) {
    return `${Math.min(Math.max(Math.max(rowCount, 1) * 42 + 48, 220), 560)}px`;
}
</script>

<style scoped lang="scss">
.bmc-record-controls {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.bmc-record-summary {
    margin-bottom: 20px;
}

.bmc-segmented {
    display: inline-flex;
    padding: 4px;
    border: 1px solid #d8dee9;
    border-radius: 8px;
    background: #fff;

    button {
        min-width: 72px;
        border: 0;
        border-radius: 6px;
        padding: 9px 12px;
        background: transparent;
        font-weight: 800;
        cursor: pointer;

        &.is-active {
            background: #10203f;
            color: #fff;
        }
    }
}

.bmc-record-grid__title {
    margin: 0 0 12px;
    font-size: 1.125rem;
    font-weight: 800;
}
</style>
