<template>
    <SitePageLayout
        eyebrow="GAMES"
        title="경기"
        description="raw-games 기록에서 생성된 경기 결과와 요약입니다."
        :pending="pending"
        :error="error"
    >
        <div v-if="seasonYears.length" class="bmc-game-list__controls">
            <div class="bmc-record-controls">
                <button
                    v-for="year in seasonYears"
                    :key="year"
                    class="bmc-chip"
                    :class="{ 'is-active': selectedYear === year }"
                    type="button"
                    @click="selectedYear = year"
                >
                    {{ year }}년
                </button>
            </div>

            <AppTabs
                v-model:active-id="selectedGroup"
                :items="groupTabItems"
                variant="pill"
                size="sm"
                class="bmc-game-list__tabs"
            />
        </div>

        <div v-if="filteredGames.length" class="bmc-game-season-summary">
            <span class="bmc-game-season-summary__chip">
                승 <strong>{{ seasonCounts.win + seasonCounts['cold-win'] + seasonCounts['forfeit-win'] }}</strong>
                <span v-if="seasonCounts['cold-win']" class="bmc-game-season-summary__sub">(콜드 {{ seasonCounts['cold-win'] }})</span>
                <span v-if="seasonCounts['forfeit-win']" class="bmc-game-season-summary__sub">(몰수 {{ seasonCounts['forfeit-win'] }})</span>
            </span>
            <span class="bmc-game-season-summary__chip">
                패 <strong>{{ seasonCounts.loss + seasonCounts['cold-loss'] }}</strong>
                <span v-if="seasonCounts['cold-loss']" class="bmc-game-season-summary__sub">(콜드 {{ seasonCounts['cold-loss'] }})</span>
            </span>
            <span v-if="seasonCounts.tie" class="bmc-game-season-summary__chip">
                무 <strong>{{ seasonCounts.tie }}</strong>
            </span>
        </div>

        <details class="bmc-game-legend">
            <summary>
                <span class="bmc-game-legend__label">결과 표기 안내</span>
                <span class="bmc-game-legend__preview">
                    <SiteGameResultBadge v-for="kind in legendKinds" :key="kind" :kind="kind" size="sm" />
                </span>
            </summary>
            <p class="bmc-game-legend__hint">
                콜드·몰수승은 game-overrides.json에서 수동 지정합니다. 몰수승은 0:7 표기·기록 미포함입니다.
            </p>
        </details>

        <p v-if="!filteredGames.length && games.length" class="bmc-state">선택한 조건의 경기가 없습니다.</p>

        <div v-else class="bmc-game-grid">
            <NuxtLink
                v-for="game in filteredGames"
                :key="game.gameId"
                class="bmc-game-card"
                :class="{ 'is-ourwin': ourWinner(game) }"
                :to="`/games/${game.gameId}`"
            >
                <div class="bmc-game-card__head">
                    <span class="bmc-game-card__date">
                        <strong>{{ dateLabel(game) }}</strong>
                        <span>{{ weekdayLabel(game) }} · {{ game.group || '-' }}조</span>
                    </span>
                    <SiteGameResultBadge :kind="resultKind(game)" size="sm" />
                </div>

                <div class="bmc-game-card__board">
                    <div class="bmc-game-card__team bmc-game-card__team--ours">
                        <span class="bmc-game-card__name">다윗 야구 선교단</span>
                        <span class="bmc-game-card__pts">{{ scoreOf(game).our }}</span>
                    </div>
                    <div class="bmc-game-card__team">
                        <span class="bmc-game-card__name">{{ opponentLabel(game) }}</span>
                        <span class="bmc-game-card__pts">{{ scoreOf(game).opponent }}</span>
                    </div>
                </div>

                <div class="bmc-game-card__foot">
                    <span class="bmc-game-card__stats">
                        <template v-if="isForfeitGame(game)">몰수승 · 기록 미포함</template>
                        <template v-else>
                            {{ game.summary?.hits ?? 0 }}안타 · {{ game.summary?.homeRuns ?? 0 }}홈런 · {{ game.summary?.steals ?? 0 }}도루
                        </template>
                    </span>
                    <span v-if="game.youtube" class="bmc-game-card__video">경기 영상</span>
                </div>
            </NuxtLink>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
import {
    isForfeitResult,
    isWinResult,
    resolveDisplayScore,
    resolveGameResult,
    summarizeSeasonResults,
    type GameResultKind,
} from '~/utils/game-result';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type Game = {
    gameId: string;
    gameDate: string;
    year?: number;
    seasonYear?: number;
    opponent: string;
    opponentName?: string;
    group?: string;
    score?: { our: number; opponent: number };
    summary?: { hits?: number; homeRuns?: number; steals?: number };
    opponentSummary?: { teamName?: string };
    youtube?: { youtubeUrl: string } | null;
    result?: GameResultKind | null;
    excludeFromRecords?: boolean;
};

definePageMeta({ title: '경기' });

const legendKinds: GameResultKind[] = ['win', 'loss', 'cold-win', 'cold-loss', 'forfeit-win'];

const { data, pending, error } = useSiteData<Game[]>('generated/games.json');
const games = computed(() => [...(data.value ?? [])].sort((a, b) => b.gameDate.localeCompare(a.gameDate)));

const selectedYear = ref<number | null>(null);
const selectedGroup = ref('all');
const { tabItemsForYear } = useSeasonTeams();

const seasonYears = computed(() => {
    const years = new Set<number>();

    for (const game of games.value) {
        const year = getSeasonYear(game);
        if (year) years.add(year);
    }

    return [...years].sort((a, b) => b - a);
});

watchEffect(() => {
    if (!selectedYear.value && seasonYears.value.length) {
        selectedYear.value = seasonYears.value[0];
    }
});

watch(selectedYear, () => {
    selectedGroup.value = 'all';
});

const groupTabItems = computed(() => tabItemsForYear(selectedYear.value ?? new Date().getFullYear()));

const yearGames = computed(() =>
    games.value.filter((game) => getSeasonYear(game) === selectedYear.value),
);

const filteredGames = computed(() =>
    yearGames.value.filter((game) => selectedGroup.value === 'all' || game.group === selectedGroup.value),
);

const seasonCounts = computed(() => summarizeSeasonResults(filteredGames.value));

function formatOpponent(opponent = '') {
    return opponent.replace(/-/g, ' ');
}

function gameInput(game: Game) {
    return {
        score: game.score,
        result: game.result,
        excludeFromRecords: game.excludeFromRecords,
    };
}

function resultKind(game: Game): GameResultKind {
    return resolveGameResult(gameInput(game));
}

function isForfeitGame(game: Game) {
    return isForfeitResult(game.result);
}

function scoreOf(game: Game) {
    return resolveDisplayScore(gameInput(game));
}

function opponentLabel(game: Game) {
    return game.opponentName || game.opponentSummary?.teamName || formatOpponent(game.opponent);
}

function dateLabel(game: Game) {
    const [, month, day] = game.gameDate.split('-');
    return `${month}.${day}`;
}

function weekdayLabel(game: Game) {
    const day = new Date(game.gameDate).getDay();
    return Number.isNaN(day) ? '' : `${WEEKDAYS[day]}요일`;
}

function ourWinner(game: Game) {
    return isWinResult(resultKind(game));
}
</script>

<style scoped lang="scss">
@use "~/assets/scss/pages/records" as *;
@use "site/tokens" as *;

.bmc-game-list__controls {
    margin-bottom: 28px;
}

.bmc-record-controls {
    @include bmc-record-controls(8px, 16px, stretch);
}

.bmc-game-list__tabs {
    margin-bottom: 0;
}

.bmc-game-season-summary {
    margin-bottom: 24px;
}

.bmc-game-season-summary__sub {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(#fff, 0.5);
}

// 결과 표기: 접이식(애플처럼 군더더기 없이)
.bmc-game-legend {
    margin-bottom: 32px;
    border: 1px solid rgba(#fff, 0.08);
    border-radius: 14px;
    background: rgba(#fff, 0.02);

    summary {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        cursor: pointer;
        list-style: none;
        user-select: none;

        &::-webkit-details-marker {
            display: none;
        }

        &::after {
            content: '⌄';
            margin-left: auto;
            font-size: 1.1rem;
            line-height: 1;
            color: rgba(#fff, 0.4);
            transition: transform 0.2s ease;
        }
    }

    &[open] summary::after {
        transform: rotate(180deg);
    }

    &__label {
        font-size: 0.875rem;
        font-weight: 800;
        color: #fff;
    }

    &__preview {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    &__hint {
        margin: 0;
        padding: 0 18px 16px;
        font-size: 0.8125rem;
        line-height: 1.6;
        color: rgba(#fff, 0.55);
    }

    @media (max-width: 560px) {
        summary {
            flex-wrap: wrap;

            &::after {
                order: 1;
                margin-left: 0;
            }
        }

        &__preview {
            flex-basis: 100%;
            order: 2;
        }
    }
}

// 경기 카드 그리드 — 넉넉한 여백
.bmc-game-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
}
</style>
