<template>
    <SitePageLayout eyebrow="RECORDS" title="전체 기록" description="누적 타자·투수 기록을 확인합니다." :pending="pending" :error="error">
        <div v-if="teamTotal" class="bmc-grid bmc-grid--4 bmc-record-grid__stats">
            <article class="bmc-stat-card">
                <strong>{{ teamTotal.totalGames }}</strong>
                <span>총 경기</span>
            </article>
            <article class="bmc-stat-card">
                <strong>{{ teamTotal.totalPlayers }}</strong>
                <span>총 선수</span>
            </article>
            <article class="bmc-stat-card">
                <strong>{{ teamTotal.totalHits }}</strong>
                <span>팀 안타</span>
            </article>
            <article class="bmc-stat-card">
                <strong>{{ teamTotal.totalRuns }}</strong>
                <span>팀 득점</span>
            </article>
        </div>

        <section class="bmc-record-grid">
            <h3 class="bmc-record-grid__title">타자 기록</h3>
            <ClientOnly>
                <AppGrid grid-id="batting-grid" class="bmc-record-grid__grid ag-theme-quartz" :row-data="battingRows"
                    :column-defs="battingColumns" :default-col-def="defaultColDef" animate-rows
                    :style="{ height: battingGridHeight, width: '100%' }" />
            </ClientOnly>
        </section>

        <section class="bmc-record-grid">
            <h3 class="bmc-record-grid__title">투수 기록</h3>
            <ClientOnly>
                <AppGrid grid-id="pitching-grid" class="bmc-record-grid__grid ag-theme-quartz" :row-data="pitchingRows"
                    :column-defs="pitchingColumns" :default-col-def="defaultColDef" animate-rows
                    :style="{ height: pitchingGridHeight, width: '100%' }" />
            </ClientOnly>
        </section>
    </SitePageLayout>
</template>

<script setup lang="ts">
import type { ColDef } from 'ag-grid-community';
import { mergeBattingRowsByName, mergePitchingRowsByName } from '~/utils/record-aggregate';

type TeamTotal = {
    totalGames: number;
    totalPlayers: number;
    totalHits: number;
    totalRuns: number;
};

type BattingRow = {
    playerId: string;
    name: string;
    group: string;
    g: number;
    pa: number;
    ab: number;
    r: number;
    h: number;
    double: number;
    triple: number;
    hr: number;
    rbi: number;
    bb: number;
    hbp: number;
    so: number;
    sb: number;
    avg: string;
    ops: string;
};

type PitchingRow = {
    playerId: string;
    name: string;
    group: string;
    g: number;
    outs: number;
    h: number;
    r: number;
    er: number;
    bb: number;
    hbp: number;
    so: number;
    win: number;
    loss: number;
    save: number;
    ip: string;
    era: string;
    whip: string;
};

definePageMeta({ title: '전체 기록' });

const { data: teamTotal, pending: teamPending, error: teamError } = useSiteData<TeamTotal>('summary/team-total.json');
const { data: batting, pending: battingPending, error: battingError } = useSiteData<BattingRow[]>('summary/batting-total.json');
const { data: pitching, pending: pitchingPending, error: pitchingError } = useSiteData<PitchingRow[]>('summary/pitching-total.json');

const pending = computed(() => teamPending.value || battingPending.value || pitchingPending.value);
const error = computed(() => teamError.value || battingError.value || pitchingError.value);

const battingRows = computed(() => mergeBattingRowsByName(batting.value ?? []));
const pitchingRows = computed(() => mergePitchingRowsByName(pitching.value ?? []));

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 72,
    sortable: true,
    filter: true,
    resizable: true,
};

const battingColumns: ColDef[] = [
    { field: 'name', headerName: '이름', minWidth: 96 },
    { field: 'g', headerName: 'G', width: 72, filter: 'agNumberColumnFilter' },
    { field: 'avg', headerName: 'AVG', width: 88, sort: 'desc', sortIndex: 0 },
    { field: 'ops', headerName: 'OPS', width: 88 },
    { field: 'h', headerName: 'H', width: 72, filter: 'agNumberColumnFilter' },
    { field: 'rbi', headerName: 'RBI', width: 80, filter: 'agNumberColumnFilter' },
    {
        field: 'hr',
        headerName: 'HR',
        width: 72,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => String(params.value ?? 0),
    },
];

const pitchingColumns: ColDef[] = [
    { field: 'name', headerName: '이름', minWidth: 96 },
    { field: 'g', headerName: 'G', width: 72, filter: 'agNumberColumnFilter' },
    { field: 'ip', headerName: 'IP', width: 80 },
    { field: 'era', headerName: 'ERA', width: 88, sort: 'asc', sortIndex: 0 },
    { field: 'whip', headerName: 'WHIP', width: 88 },
    { field: 'so', headerName: 'SO', width: 72, filter: 'agNumberColumnFilter' },
    { field: 'win', headerName: 'W', width: 72, filter: 'agNumberColumnFilter' },
];

function gridHeight(rowCount: number) {
    const body = Math.max(rowCount, 1) * 42;
    return `${Math.min(Math.max(body + 48, 240), 560)}px`;
}

const battingGridHeight = computed(() => gridHeight(battingRows.value.length));
const pitchingGridHeight = computed(() => gridHeight(pitchingRows.value.length));
</script>

<style scoped lang="scss">
.bmc-record-grid {
    &+& {
        margin-top: 28px;
    }

    &__stats {
        margin-bottom: 24px;
    }

    &__title {
        margin: 0 0 12px;
        font-size: 1.125rem;
        font-weight: 800;
    }

    &__grid {
        width: 100%;
    }
}
</style>
