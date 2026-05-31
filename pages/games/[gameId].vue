<template>
    <SitePageLayout
        eyebrow="GAME DETAIL"
        :title="game ? `vs ${opponentLabel(game)}` : '경기 상세'"
        :description="game ? `${game.gameDate} · ${game.group || '-'}조` : ''"
        :pending="pending"
        :error="error || (!game && !pending ? '경기 기록을 찾을 수 없습니다.' : '')"
    >
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
                <a
                    class="bmc-btn bmc-btn--primary"
                    :href="game.youtube?.youtubeUrl || YOUTUBE_CHANNEL_URL"
                    target="_blank"
                    rel="noopener noreferrer"
                >
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

            <section v-if="!isForfeit && game.highlights?.length" class="bmc-stat-panel">
                <h3>하이라이트</h3>
                <ul class="bmc-highlight-list">
                    <li v-for="item in game.highlights" :key="`${item.type}-${item.text}`">
                        <strong>{{ item.type }}</strong>
                        <span>{{ item.text }}</span>
                    </li>
                </ul>
            </section>
        </template>
    </SitePageLayout>
</template>

<script setup lang="ts">
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
    youtube?: { youtubeUrl: string } | null;
    result?: GameResultKind | null;
    inningsPlayed?: number | null;
    excludeFromRecords?: boolean;
};

definePageMeta({ title: '경기 상세' });

const route = useRoute();
const { fetchJson } = useBasePath();
const game = ref<Game | null>(null);
const pending = ref(true);
const error = ref('');

const gameResult = computed(() =>
    game.value
        ? resolveGameResult({
              score: game.value.score,
              result: game.value.result,
              inningsPlayed: game.value.inningsPlayed,
              excludeFromRecords: game.value.excludeFromRecords,
          })
        : null,
);

const isForfeit = computed(() => isForfeitResult(game.value?.result));
const displayScore = computed(() => (game.value ? formatDisplayScore(game.value) : ''));

const detailResultClass = computed(() => (gameResult.value ? `bmc-game-detail--${gameResult.value}` : ''));

function formatOpponent(opponent = '') {
    return opponent.replace(/-/g, ' ');
}

function opponentLabel(game: Game) {
    return game.opponentName || game.opponentSummary?.teamName || formatOpponent(game.opponent);
}

function statLine(summary: Summary) {
    return `${summary?.hits ?? 0}안타 · ${summary?.homeRuns ?? 0}홈런 · ${summary?.steals ?? 0}도루 · ${
        summary?.strikeouts ?? 0
    }삼진 · ${summary?.errors ?? 0}실책 · ${summary?.walksAndHbp ?? 0}사사구`;
}

onMounted(async () => {
    try {
        game.value = await fetchJson<Game>(`games/${route.params.gameId}.json`);
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
</style>
