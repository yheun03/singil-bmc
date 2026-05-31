<template>
    <SitePageLayout
        eyebrow="GAME DETAIL"
        :title="game ? `vs ${game.opponentSummary?.teamName || formatOpponent(game.opponent)}` : '경기 상세'"
        :description="game ? `${game.gameDate} · ${game.group || '-'}조` : ''"
        :pending="pending"
        :error="error || (!game && !pending ? '경기 기록을 찾을 수 없습니다.' : '')"
    >
        <template v-if="game">
            <section class="bmc-game-detail">
                <div>
                    <p class="bmc-game-detail__label">Final Score</p>
                    <strong>{{ game.score?.our ?? 0 }} : {{ game.score?.opponent ?? 0 }}</strong>
                    <p>다윗 야구 선교단 vs {{ game.opponentSummary?.teamName || formatOpponent(game.opponent) }}</p>
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

            <div class="bmc-grid bmc-grid--2">
                <article class="bmc-stat-panel">
                    <h3>우리팀 요약</h3>
                    <p>{{ statLine(game.summary) }}</p>
                </article>
                <article class="bmc-stat-panel">
                    <h3>{{ game.opponentSummary?.teamName || '상대팀' }} 요약</h3>
                    <p>{{ statLine(game.opponentSummary) }}</p>
                </article>
            </div>

            <section v-if="game.highlights?.length" class="bmc-stat-panel">
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
    group?: string;
    score?: { our: number; opponent: number };
    summary?: Summary;
    opponentSummary?: Summary;
    highlights?: Array<{ type: string; text: string }>;
    youtube?: { youtubeUrl: string } | null;
};

definePageMeta({ title: '경기 상세' });

const route = useRoute();
const { fetchJson } = useBasePath();
const game = ref<Game | null>(null);
const pending = ref(true);
const error = ref('');

function formatOpponent(opponent = '') {
    return opponent.replace(/-/g, ' ');
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

    strong {
        display: block;
        font-size: 2.5rem;
        font-weight: 900;
        color: #10203f;
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
