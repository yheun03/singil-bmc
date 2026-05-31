<template>
    <SitePageLayout
        eyebrow="GAMES"
        title="경기"
        description="raw-games 기록에서 생성된 경기 결과와 요약입니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--2">
            <NuxtLink v-for="game in games" :key="game.gameId" class="bmc-game-card" :to="`/games/${game.gameId}`">
                <span class="bmc-game-card__date">{{ game.gameDate }} · {{ game.group || '-' }}조</span>
                <h3>다윗 야구 선교단 vs {{ game.opponentSummary?.teamName || formatOpponent(game.opponent) }}</h3>
                <strong>{{ game.score?.our ?? 0 }} : {{ game.score?.opponent ?? 0 }}</strong>
                <p>
                    {{ game.summary?.hits ?? 0 }}안타 · {{ game.summary?.homeRuns ?? 0 }}홈런 ·
                    {{ game.summary?.steals ?? 0 }}도루
                </p>
                <span class="bmc-game-card__video">{{ game.youtube ? '경기 영상 연결됨' : 'YouTube 채널에서 영상 확인' }}</span>
            </NuxtLink>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type Game = {
    gameId: string;
    gameDate: string;
    opponent: string;
    group?: string;
    score?: { our: number; opponent: number };
    summary?: { hits?: number; homeRuns?: number; steals?: number };
    opponentSummary?: { teamName?: string };
    youtube?: { youtubeUrl: string } | null;
};

definePageMeta({ title: '경기' });

const { data, pending, error } = useSiteData<Game[]>('generated/games.json');
const games = computed(() => [...(data.value ?? [])].sort((a, b) => b.gameDate.localeCompare(a.gameDate)));

function formatOpponent(opponent = '') {
    return opponent.replace(/-/g, ' ');
}
</script>

<style scoped lang="scss">
.bmc-game-card {
    display: grid;
    gap: 10px;
    padding: 22px;
    border: 1px solid #d8dee9;
    border-radius: 8px;
    background: #fff;
    color: inherit;
    text-decoration: none;

    h3,
    p {
        margin: 0;
    }

    h3 {
        font-size: 1rem;
        font-weight: 900;
    }

    strong {
        font-size: 2rem;
        font-weight: 900;
        color: #10203f;
    }
}

.bmc-game-card__date,
.bmc-game-card__video {
    font-size: 0.8125rem;
    font-weight: 800;
    color: #1e56c8;
}
</style>
