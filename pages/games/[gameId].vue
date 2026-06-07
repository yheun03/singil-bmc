<template>
    <SitePageLayout eyebrow="GAME DETAIL" :title="game ? `vs ${opponentLabel(game)}` : '경기 상세'"
        :description="game ? `${game.gameDate} · ${game.group || '-'}조` : ''" :pending="pending"
        :error="error || (!game && !pending ? '경기 기록을 찾을 수 없습니다.' : '')">
        <template v-if="game">
            <section class="bmc-game-detail" :class="detailResultClass">
                <div>
                    <div class="bmc-game-detail__head">
                        <p class="bmc-game-detail__label">Final Score</p>
                        <SiteGameResultBadge v-if="gameResult" :kind="gameResult" size="lg" />
                    </div>
                    <strong class="bmc-game-detail__score">{{ displayScore }}</strong>
                    <p>다윗 야구 선교단 vs {{ opponentLabel(game) }}</p>
                    <p v-if="isForfeit" class="bmc-game-detail__forfeit-note">몰수승 경기로 타·투수 기록이 없습니다.</p>
                </div>
                <a class="bmc-btn bmc-btn--primary" :href="game.youtube?.youtubeUrl || YOUTUBE_CHANNEL_URL"
                    target="_blank" rel="noopener noreferrer">
                    {{ game.youtube ? '경기 영상 보기' : 'YouTube 채널 바로가기' }}
                </a>
            </section>

            <div v-if="!isForfeit" class="bmc-grid bmc-grid--2">
                <article class="bmc-stat-panel">
                    <h3>우리팀 요약</h3>
                    <p>{{ statLine(game.summary) }}</p>
                </article>
                <article class="bmc-stat-panel">
                    <h3>{{ opponentLabel(game) }} 요약</h3>
                    <p>{{ statLine(game.opponentSummary) }}</p>
                </article>
            </div>

            <section v-if="!isForfeit && filteredHighlights.length" class="bmc-stat-panel">
                <h3>하이라이트</h3>
                <ul class="bmc-highlight-list">
                    <li v-for="item in filteredHighlights" :key="`${item.type}-${item.text}`">
                        <strong>{{ item.type }}</strong>
                        <span>{{ item.text }}</span>
                    </li>
                </ul>
            </section>

            <section v-if="!isForfeit && hasTeamRecords" class="bmc-stat-panel bmc-game-records">
                <h3>우리팀 기록</h3>

                <div v-if="battingRows.length" class="bmc-game-records__block">
                    <h4>타자</h4>
                    <ClientOnly>
                        <AppGrid grid-id="game-batting-grid" class="bmc-game-records__grid ag-theme-quartz"
                            :row-data="battingRows" :column-defs="battingColumns" :default-col-def="defaultColDef"
                            animate-rows :style="{ height: battingGridHeight, width: '100%' }" />
                    </ClientOnly>
                </div>

                <div v-if="pitchingRows.length" class="bmc-game-records__block">
                    <h4>투수</h4>
                    <ClientOnly>
                        <AppGrid grid-id="game-pitching-grid" class="bmc-game-records__grid ag-theme-quartz"
                            :row-data="pitchingRows" :column-defs="pitchingColumns" :default-col-def="defaultColDef"
                            animate-rows :style="{ height: pitchingGridHeight, width: '100%' }" />
                    </ClientOnly>
                </div>
            </section>

            <section v-if="!isForfeit && detailedRecords.length" class="bmc-stat-panel bmc-detailed-records">
                <h3>상세 기록</h3>
                <div class="bmc-detailed-records__wrap">
                    <table class="bmc-detailed-records__table">
                        <thead>
                            <tr>
                                <th scope="col">타순</th>
                                <th scope="col">수비</th>
                                <th scope="col">선수</th>
                                <th v-for="inning in detailedRecordInnings" :key="inning" scope="col"
                                    class="bmc-detailed-records__inning-head">
                                    {{ inning }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, rowIndex) in detailedRecords"
                                :key="`${row.order}-${row.position}-${row.name}`"
                                :class="{ 'is-substitution': isSubstitutionRow(row, rowIndex) }">
                                <td class="bmc-detailed-records__order">
                                    <span>{{ row.order }}</span>
                                </td>
                                <td>
                                    <span class="bmc-detailed-records__position">{{ row.position || '-' }}</span>
                                </td>
                                <th scope="row">
                                    <span class="bmc-detailed-records__player">{{ row.name }}</span>
                                    <span v-if="isSubstitutionRow(row, rowIndex)"
                                        class="bmc-detailed-records__sub-label">교체</span>
                                </th>
                                <td v-for="(result, index) in row.innings" :key="`${row.name}-${index}`"
                                    class="bmc-detailed-records__inning" :class="{ 'has-play': !!result }">
                                    <span v-if="result" class="bmc-detailed-records__play">
                                        {{ result }}
                                    </span>
                                    <span v-else class="bmc-detailed-records__empty">-</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </template>
    </SitePageLayout>
</template>

<script setup lang="ts">
import type { ColDef } from 'ag-grid-community';
import { YOUTUBE_CHANNEL_URL } from '~/constants/site';
import { formatDisplayScore, isForfeitResult, resolveGameResult, type GameResultKind } from '~/utils/game-result';

type Summary = {
    teamName?: string;
    hits?: number;
    homeRuns?: number;
    steals?: number;
    strikeouts?: number;
    errors?: number;
    walksAndHbp?: number;
} | null;
type BattingRow = {
    playerId?: string;
    name: string;
    pa?: number;
    ab?: number;
    r?: number;
    h?: number;
    double?: number;
    triple?: number;
    hr?: number;
    rbi?: number;
    bb?: number;
    hbp?: number;
    so?: number;
    sb?: number;
};

type PitchingRow = {
    playerId?: string;
    name: string;
    ip?: string;
    outs?: number;
    h?: number;
    r?: number;
    er?: number;
    bb?: number;
    hbp?: number;
    so?: number;
    win?: number;
    loss?: number;
    save?: number;
};

type Game = {
    gameId: string;
    gameDate: string;
    opponent: string;
    opponentName?: string;
    group?: string;
    score?: { our: number; opponent: number };
    summary?: Summary;
    opponentSummary?: Summary;
    highlights?: Array<{ type: string; text: string }>;
    batting?: BattingRow[];
    pitching?: PitchingRow[];
    youtube?: { youtubeUrl: string } | null;
    result?: GameResultKind | null;
    excludeFromRecords?: boolean;
};

type DetailedRecordRow = {
    name: string;
    position: string;
    order: string;
    innings: string[];
    firstInning: number;
};

definePageMeta({ title: '경기 상세' });

const route = useRoute();
const { fetchJson, getDataPath } = useBasePath();
const game = ref<Game | null>(null);
const detailedRecords = ref<DetailedRecordRow[]>([]);
const pending = ref(true);
const error = ref('');

const gameResult = computed(() =>
    game.value
        ? resolveGameResult({
            score: game.value.score,
            result: game.value.result,
            excludeFromRecords: game.value.excludeFromRecords,
        })
        : null,
);

const isForfeit = computed(() => isForfeitResult(game.value?.result));
const displayScore = computed(() => (game.value ? formatDisplayScore(game.value) : ''));

const detailResultClass = computed(() => (gameResult.value ? `bmc-game-detail--${gameResult.value}` : ''));

const battingRows = computed(() =>
    (game.value?.batting ?? []).filter((row) => Number(row.pa ?? row.ab ?? 0) > 0),
);

const pitchingRows = computed(() =>
    (game.value?.pitching ?? []).filter((row) => Number(row.outs ?? 0) > 0),
);

const hasTeamRecords = computed(() => battingRows.value.length > 0 || pitchingRows.value.length > 0);

const teamPlayerNames = computed(() => new Set([...battingRows.value, ...pitchingRows.value].map((row) => row.name)));

const filteredHighlights = computed(() =>
    (game.value?.highlights ?? [])
        .map((item) => ({
            ...item,
            text: filterHighlightText(item.text, teamPlayerNames.value),
        }))
        .filter((item) => item.text),
);

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 72,
    sortable: true,
    filter: true,
    resizable: true,
};

const numberFormatter = (params: { value: unknown }) => String(params.value ?? 0);

const battingColumns: ColDef[] = [
    { field: 'name', headerName: '이름', minWidth: 96, pinned: 'left' },
    { field: 'ab', headerName: '타수', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'r', headerName: '득점', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'h', headerName: '안타', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'double', headerName: '2루타', width: 82, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'triple', headerName: '3루타', width: 82, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'hr', headerName: '홈런', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'rbi', headerName: '타점', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'bb', headerName: '볼넷', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'hbp', headerName: '사구', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'so', headerName: '삼진', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'sb', headerName: '도루', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
];

const pitchingColumns: ColDef[] = [
    { field: 'name', headerName: '이름', minWidth: 96, pinned: 'left' },
    { field: 'ip', headerName: '이닝', width: 80 },
    { field: 'h', headerName: '피안타', width: 82, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'r', headerName: '실점', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'er', headerName: '자책', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'bb', headerName: '볼넷', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'hbp', headerName: '사구', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'so', headerName: '삼진', width: 76, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'win', headerName: '승', width: 72, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'loss', headerName: '패', width: 72, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
    { field: 'save', headerName: '세이브', width: 82, filter: 'agNumberColumnFilter', valueFormatter: numberFormatter },
];

function gridHeight(rowCount: number) {
    const body = Math.max(rowCount, 1) * 42;
    return `${Math.min(Math.max(body + 48, 180), 420)}px`;
}

const battingGridHeight = computed(() => gridHeight(battingRows.value.length));
const pitchingGridHeight = computed(() => gridHeight(pitchingRows.value.length));
const detailedRecordInnings = computed(() => {
    const maxInnings = detailedRecords.value.reduce((max, row) => Math.max(max, row.innings.length), 9);
    return Array.from({ length: Math.min(Math.max(maxInnings, 9), 12) }, (_, index) => index + 1);
});

function formatOpponent(opponent = '') {
    return opponent.replace(/-/g, ' ');
}

function opponentLabel(game: Game) {
    return game.opponentName || game.opponentSummary?.teamName || formatOpponent(game.opponent);
}

function statLine(summary: Summary) {
    return `${summary?.hits ?? 0}안타 · ${summary?.homeRuns ?? 0}홈런 · ${summary?.steals ?? 0}도루 · ${summary?.strikeouts ?? 0
        }삼진 · ${summary?.errors ?? 0}실책 · ${summary?.walksAndHbp ?? 0}사사구`;
}

function filterHighlightText(text: string, playerNames: Set<string>) {
    const chunks = text.match(/[^()\s]+\([^)]*\)/g) ?? [];
    const filtered = chunks.filter((chunk) => {
        const name = chunk.match(/^([^()]+)/)?.[1]?.trim();
        return !!name && playerNames.has(name);
    });

    return filtered.join(' ');
}

function normalizeText(value = '') {
    return value.replace(/\s+/g, ' ').trim();
}

function isSubstitutionRow(row: DetailedRecordRow, index: number) {
    return detailedRecords.value.slice(0, index).some((prev) => prev.order === row.order);
}

function firstPlayedInning(innings: string[]) {
    const index = innings.findIndex(Boolean);
    return index === -1 ? Number.POSITIVE_INFINITY : index + 1;
}

function battingOrderValue(order: string) {
    const value = Number(order);
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function parseTeamDetailedRecords(html: string) {
    if (!import.meta.client) return [];

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const heading = Array.from(doc.querySelectorAll('h3')).find((node) => normalizeText(node.textContent ?? '').includes('다윗 야구 선교단'));
    const table = heading?.nextElementSibling?.matches('table.record_table')
        ? heading.nextElementSibling
        : heading?.parentElement?.querySelector('table.record_table');

    if (!table) return [];

    return Array.from(table.querySelectorAll('tbody tr'))
        .map((tr) => {
            const head = tr.querySelector('th');
            const name = normalizeText(head?.querySelector('.name strong')?.textContent ?? '');
            const order = normalizeText(head?.querySelector('.num')?.textContent ?? '');
            const position = normalizeText(head?.querySelector('.position')?.textContent ?? '');
            const innings = Array.from(tr.querySelectorAll('td.round:not(.hide)'))
                .map((td) => normalizeText(td.textContent ?? ''))
                .slice(0, 12);

            return { name, order, position, innings, firstInning: firstPlayedInning(innings) };
        })
        .filter((row) => row.name && row.innings.some(Boolean))
        .sort((a, b) => {
            const orderDiff = battingOrderValue(a.order) - battingOrderValue(b.order);
            if (orderDiff !== 0) return orderDiff;

            const inningDiff = a.firstInning - b.firstInning;
            if (inningDiff !== 0) return inningDiff;

            return a.name.localeCompare(b.name, 'ko');
        });
}

async function loadDetailedRecords(gameId: string) {
    detailedRecords.value = [];

    try {
        const response = await fetch(getDataPath(`raw-games/${gameId}.html`));
        if (!response.ok) return;

        detailedRecords.value = parseTeamDetailedRecords(await response.text());
    } catch {
        detailedRecords.value = [];
    }
}

onMounted(async () => {
    try {
        const gameId = String(route.params.gameId);
        game.value = await fetchJson<Game>(`games/${gameId}.json`);
        await loadDetailedRecords(gameId);
    } catch (err) {
        error.value = err instanceof Error ? err.message : '경기 데이터를 불러오지 못했습니다.';
    } finally {
        pending.value = false;
    }
});

watch(
    game,
    (item) => {
        if (!item) {
            setSeoPageOverride(null);
            return;
        }

        const opponent = opponentLabel(item);
        const title = `vs ${opponent}`;
        const description = `${item.gameDate} · ${item.group || '-'}조 · ${formatDisplayScore(item)} — 신길교회 야구 선교단 경기 기록`;
        const path = `/games/${item.gameId}`;

        setSeoPageOverride({
            title,
            description,
            path,
            jsonLd: buildSportsEventJsonLd({
                name: `다윗 야구 선교단 vs ${opponent}`,
                description,
                path,
                startDate: item.gameDate,
            }),
        });
    },
    { immediate: true },
);

onUnmounted(() => setSeoPageOverride(null));
</script>

<style scoped lang="scss">
.bmc-game-detail,
.bmc-stat-panel {
    margin-bottom: 18px;
    padding: 24px;
    border: 1px solid #d8dee9;
    border-radius: 8px;
    background: #fff;
}

.bmc-game-detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;

    &__head {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 8px;
    }

    &__score {
        display: block;
        font-size: 2.5rem;
        font-weight: 900;
        color: #10203f;
    }

    &--win .bmc-game-detail__score {
        color: #0f5c2e;
    }

    &--loss .bmc-game-detail__score {
        color: #9b1c1c;
    }

    &--cold-win {
        border-color: #c9a227;
        background: linear-gradient(135deg, #fffdf5 0%, #fff 55%);
    }

    &--forfeit-win {
        border-color: #6366f1;
        background: linear-gradient(135deg, #f5f3ff 0%, #fff 55%);
    }

    &--forfeit-win .bmc-game-detail__score {
        color: #4338ca;
    }

    &__forfeit-note {
        margin: 8px 0 0;
        font-size: 0.875rem;
        color: #64748b;
    }

    &--cold-loss {
        border-color: #94a3b8;
    }

    p {
        margin: 0;
    }
}

.bmc-game-detail__label,
.bmc-stat-panel h3 {
    margin: 0 0 8px;
    font-size: 0.875rem;
    font-weight: 900;
    color: #1e56c8;
}

.bmc-stat-panel p {
    margin: 0;
    line-height: 1.65;
}

.bmc-highlight-list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
}

.bmc-game-records {
    &__block+&__block {
        margin-top: 20px;
    }

    h4 {
        margin: 0 0 10px;
        font-size: 0.9375rem;
        font-weight: 800;
        color: #10203f;
    }

    &__grid {
        --ag-font-size: 13px;
    }
}

.bmc-detailed-records {
    overflow: hidden;

    h3 {
        margin: 0;
    }

    &__wrap {
        margin-top: 18px;
        overflow-x: auto;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background:
            linear-gradient(90deg, rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0)) left / 20px 100% no-repeat,
            #fff;
    }

    &__table {
        width: 100%;
        min-width: 980px;
        border-collapse: separate;
        border-spacing: 0;
        color: #1f2937;
        font-size: 0.875rem;

        thead th {
            position: sticky;
            top: 0;
            padding: 12px 10px;
            border-bottom: 1px solid #dbe3ef;
            background: #f8fafc;
            color: #475569;
            font-size: 0.8125rem;
            font-weight: 900;
            text-align: center;
            white-space: nowrap;
        }

        thead th:nth-child(3) {
            text-align: left;
        }

        tbody tr {
            transition: background-color 0.15s ease;

            &:nth-child(even) {
                background: #fbfcff;
            }

            &:hover {
                background: #f3f7ff;
            }

            &.is-substitution {
                background: #fffdf7;
            }

            &.is-substitution:hover {
                background: #fff7df;
            }
        }

        tbody th,
        tbody td {
            padding: 10px;
            border-bottom: 1px solid #edf1f7;
            vertical-align: middle;
        }

        tbody tr:last-child th,
        tbody tr:last-child td {
            border-bottom: 0;
        }

        tbody th {
            width: 120px;
            color: #10203f;
            font-weight: 900;
            white-space: nowrap;
        }

        td:first-child,
        td:nth-child(2) {
            width: 58px;
            text-align: center;
            white-space: nowrap;
        }
    }

    &__inning-head {
        width: 82px;
        min-width: 82px;
    }

    &__order {
        span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 999px;
            background: #eef4ff;
            color: #2563eb;
            font-weight: 900;
        }
    }

    &__position {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 30px;
        min-height: 28px;
        padding: 4px 8px;
        border: 1px solid #dbeafe;
        border-radius: 999px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 0.8125rem;
        font-weight: 900;
        line-height: 1;
    }

    &__player {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    &__sub-label {
        display: inline-flex;
        align-items: center;
        margin-left: 8px;
        padding: 3px 7px;
        border-radius: 999px;
        background: #fff7ed;
        color: #c2410c;
        font-size: 0.6875rem;
        font-weight: 900;
        vertical-align: middle;
    }

    &__inning {
        width: 82px;
        min-width: 82px;
        text-align: center;

        &.has-play {
            background: rgba(239, 246, 255, 0.55);
        }
    }

    &__play {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 54px;
        max-width: 100%;
        min-height: 30px;
        padding: 6px 8px;
        border: 1px solid #dbeafe;
        border-radius: 8px;
        background: #fff;
        color: #1e3a8a;
        font-size: 0.8125rem;
        font-weight: 800;
        line-height: 1.25;
        white-space: normal;
        word-break: keep-all;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    &__empty {
        color: #cbd5e1;
        font-size: 0.75rem;
    }
}

@media (max-width: 640px) {
    .bmc-detailed-records {
        &__table {
            min-width: 900px;
            font-size: 0.8125rem;

            thead th,
            tbody th,
            tbody td {
                padding: 9px 8px;
            }
        }

        &__inning,
        &__inning-head {
            width: 74px;
            min-width: 74px;
        }

        &__play {
            min-width: 48px;
            min-height: 28px;
            padding: 5px 7px;
            font-size: 0.75rem;
        }
    }
}
</style>
