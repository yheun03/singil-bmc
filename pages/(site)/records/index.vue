<template>
    <SitePageLayout
        eyebrow="RECORDS"
        title="전체 기록"
        description="누적 타자·투수 기록을 확인합니다."
        :pending="pending"
        :error="error"
    >
        <div v-if="teamTotal" class="bmc-grid bmc-grid--4" style="margin-bottom:24px;">
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

        <h3 style="margin:0 0 12px;font-size:1.125rem;font-weight:800;">타자 기록</h3>
        <div class="bmc-table-wrap" style="margin-bottom:28px;">
            <table class="bmc-table">
                <thead>
                    <tr>
                        <th>이름</th>
                        <th>조</th>
                        <th>G</th>
                        <th>AVG</th>
                        <th>OPS</th>
                        <th>H</th>
                        <th>RBI</th>
                        <th>HR</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in batting" :key="row.playerId">
                        <td>{{ row.name }}</td>
                        <td>{{ row.group }}조</td>
                        <td>{{ row.g }}</td>
                        <td>{{ row.avg }}</td>
                        <td>{{ row.ops }}</td>
                        <td>{{ row.h }}</td>
                        <td>{{ row.rbi }}</td>
                        <td>{{ row.hr ?? 0 }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 style="margin:0 0 12px;font-size:1.125rem;font-weight:800;">투수 기록</h3>
        <div class="bmc-table-wrap">
            <table class="bmc-table">
                <thead>
                    <tr>
                        <th>이름</th>
                        <th>조</th>
                        <th>G</th>
                        <th>IP</th>
                        <th>ERA</th>
                        <th>WHIP</th>
                        <th>SO</th>
                        <th>W</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in pitching" :key="row.playerId">
                        <td>{{ row.name }}</td>
                        <td>{{ row.group }}조</td>
                        <td>{{ row.g }}</td>
                        <td>{{ row.ip }}</td>
                        <td>{{ row.era }}</td>
                        <td>{{ row.whip }}</td>
                        <td>{{ row.so }}</td>
                        <td>{{ row.win }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
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
    avg: string;
    ops: string;
    h: number;
    rbi: number;
    hr?: number;
};

type PitchingRow = {
    playerId: string;
    name: string;
    group: string;
    g: number;
    ip: string;
    era: string;
    whip: string;
    so: number;
    win: number;
};

definePageMeta({ title: '전체 기록' });

const { fetchJson } = useBasePath();
const teamTotal = ref<TeamTotal | null>(null);
const batting = ref<BattingRow[]>([]);
const pitching = ref<PitchingRow[]>([]);
const pending = ref(true);
const error = ref('');

onMounted(async () => {
    try {
        const [team, battingRows, pitchingRows] = await Promise.all([
            fetchJson<TeamTotal>('summary/team-total.json'),
            fetchJson<BattingRow[]>('summary/batting-total.json'),
            fetchJson<PitchingRow[]>('summary/pitching-total.json'),
        ]);
        teamTotal.value = team;
        batting.value = battingRows;
        pitching.value = pitchingRows;
    } catch (err) {
        error.value = err instanceof Error ? err.message : '기록 데이터를 불러오지 못했습니다.';
    } finally {
        pending.value = false;
    }
});
</script>
