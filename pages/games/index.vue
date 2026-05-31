<template>
    <SitePageLayout
        eyebrow="GAMES"
        title="경기"
        description="raw-games 기록에서 생성된 경기 결과와 요약입니다."
        :pending="pending"
        :error="error"
    >
        <div v-if="games.length" class="bmc-game-season-summary">
            <span class="bmc-game-season-summary__chip">
                승 <strong>{{ seasonCounts.win + seasonCounts['cold-win'] }}</strong>
                <span v-if="seasonCounts['cold-win']" class="bmc-game-season-summary__sub">(콜드 {{ seasonCounts['cold-win'] }})</span>
            </span>
            <span class="bmc-game-season-summary__chip">
                패 <strong>{{ seasonCounts.loss + seasonCounts['cold-loss'] }}</strong>
                <span v-if="seasonCounts['cold-loss']" class="bmc-game-season-summary__sub">(콜드 {{ seasonCounts['cold-loss'] }})</span>
            </span>
            <span v-if="seasonCounts.tie" class="bmc-game-season-summary__chip">
                무 <strong>{{ seasonCounts.tie }}</strong>
            </span>
        </div>

        <div class="bmc-game-results-legend" aria-label="경기 결과 표기 안내">
            <div>
                <p class="bmc-game-results-legend__title">결과 표기</p>
                <p class="bmc-game-results-legend__hint">콜드는 10점차 이상 조기 종료 경기로 추정합니다.</p>
            </div>
            <div class="bmc-game-results-legend__items">
                <SiteGameResultBadge v-for="kind in legendKinds" :key="kind" :kind="kind" size="sm" />
            </div>
        </div>

        <div class="bmc-grid bmc-grid--2">
            <NuxtLink
                v-for="game in games"
                :key="game.gameId"
                class="bmc-game-card"
                :class="cardClass(game)"
                :to="`/games/${game.gameId}`"
            >
                <div class="bmc-game-card__top">
                    <span class="bmc-game-card__date">{{ game.gameDate }} · {{ game.group || '-' }}조</span>
                    <SiteGameResultBadge :kind="resultKind(game)" size="sm" />
                </div>
                <h3 class="bmc-game-card__matchup">
                    다윗 야구 선교단 vs {{ game.opponentName || game.opponentSummary?.teamName || formatOpponent(game.opponent) }}
                </h3>
                <div class="bmc-game-card__score-row">
                    <span class="bmc-game-card__score" :class="scoreClass(game)">
                        {{ game.score?.our ?? 0 }} : {{ game.score?.opponent ?? 0 }}
                    </span>
                </div>
                <p class="bmc-game-card__stats">
                    {{ game.summary?.hits ?? 0 }}안타 · {{ game.summary?.homeRuns ?? 0 }}홈런 ·
                    {{ game.summary?.steals ?? 0 }}도루
                </p>
                <span class="bmc-game-card__video">{{ game.youtube ? '경기 영상 연결됨' : 'YouTube 채널에서 영상 확인' }}</span>
            </NuxtLink>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
import {
    resolveGameResult,
    summarizeSeasonResults,
    type GameResultKind,
} from '~/utils/game-result';

type Game = {
    gameId: string;
    gameDate: string;
    opponent: string;
    opponentName?: string;
    group?: string;
    score?: { our: number; opponent: number };
    summary?: { hits?: number; homeRuns?: number; steals?: number };
    opponentSummary?: { teamName?: string };
    youtube?: { youtubeUrl: string } | null;
    result?: GameResultKind | null;
    inningsPlayed?: number | null;
};

definePageMeta({ title: '경기' });

const legendKinds: GameResultKind[] = ['win', 'loss', 'cold-win', 'cold-loss'];

const { data, pending, error } = useSiteData<Game[]>('generated/games.json');
const games = computed(() => [...(data.value ?? [])].sort((a, b) => b.gameDate.localeCompare(a.gameDate)));

const seasonCounts = computed(() => summarizeSeasonResults(games.value));

function formatOpponent(opponent = '') {
    return opponent.replace(/-/g, ' ');
}

function resultKind(game: Game): GameResultKind {
    return resolveGameResult({
        score: game.score,
        result: game.result,
        inningsPlayed: game.inningsPlayed,
    });
}

function cardClass(game: Game) {
    return `bmc-game-card--${resultKind(game)}`;
}

function scoreClass(game: Game) {
    const kind = resultKind(game);
    if (kind === 'win' || kind === 'cold-win') return 'is-our-ahead';
    if (kind === 'loss' || kind === 'cold-loss') return 'is-our-behind';
    return '';
}
</script>

<style scoped lang="scss">
.bmc-game-season-summary__sub {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
}

.bmc-game-card__score.is-our-ahead {
    color: #0f5c2e;
}

.bmc-game-card__score.is-our-behind {
    color: #9b1c1c;
}
</style>
