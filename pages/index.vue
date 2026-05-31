<template>
    <div>
        <section class="bmc-hero bmc-hero--photo" :style="heroStyle">
            <div class="bmc-hero__inner">
                <div>
                    <img
                        class="bmc-hero__logo"
                        :src="teamLogoUrl"
                        alt="신길교회 야구선교단"
                        width="112"
                        height="112"
                    />
                    <p class="bmc-hero__eyebrow">Singil Church Baseball Mission</p>
                    <h1 class="bmc-hero__title">신길교회<br>야구 선교단</h1>
                    <p class="bmc-hero__desc">
                        야구를 통해 교제하고, 함께 땀 흘리며, 복음의 가치를 나누는 공동체입니다.
                    </p>
                    <div class="bmc-hero__actions">
                        <NuxtLink class="bmc-btn bmc-btn--primary" to="/records">기록 보기</NuxtLink>
                        <NuxtLink class="bmc-btn bmc-btn--outline-light" to="/videos">영상 보기</NuxtLink>
                        <NuxtLink class="bmc-btn bmc-btn--outline-light" to="/contact">문의하기</NuxtLink>
                    </div>
                </div>

                <aside v-if="recentGame" class="bmc-hero__visual">
                    <p class="bmc-hero__match-label">Latest Match</p>
                    <div class="bmc-hero__scoreboard">
                        <span class="bmc-hero__team">다윗 야구 선교단</span>
                        <strong class="bmc-hero__score">
                            {{ recentGame.score?.our ?? 0 }} : {{ recentGame.score?.opponent ?? 0 }}
                        </strong>
                        <span class="bmc-hero__team">vs {{ formatOpponent(recentGame.opponent) }}</span>
                    </div>
                    <p class="bmc-hero__meta">{{ recentGame.gameDate }} · {{ recentGame.group || 'A' }}조</p>
                </aside>
            </div>
        </section>

        <section class="bmc-section bmc-section--white">
            <div class="bmc-section__inner">
                <div class="bmc-section__head">
                    <div>
                        <p class="bmc-section__desc" style="margin-bottom:4px;font-weight:700;color:#1e56c8;">TEAM RECORD</p>
                        <h2 class="bmc-section__title">시즌 기록 요약</h2>
                    </div>
                    <NuxtLink class="bmc-section__more" to="/records">전체 기록 →</NuxtLink>
                </div>

                <SiteLoading v-if="pending" />
                <p v-else-if="error" class="bmc-state bmc-state--error">{{ error }}</p>
                <div v-else-if="teamTotal" class="bmc-grid bmc-grid--4">
                    <article class="bmc-stat-card">
                        <strong>{{ teamTotal.totalGames }}</strong>
                        <span>총 경기</span>
                    </article>
                    <article class="bmc-stat-card">
                        <strong>{{ teamTotal.totalPlayers }}</strong>
                        <span>등록 선수</span>
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
            </div>
        </section>

        <section class="bmc-section">
            <div class="bmc-section__inner">
                <div class="bmc-section__head">
                    <div>
                        <p class="bmc-section__desc" style="margin-bottom:4px;font-weight:700;color:#1e56c8;">LEADERS</p>
                        <h2 class="bmc-section__title">운영진</h2>
                    </div>
                    <NuxtLink class="bmc-section__more" to="/about/leaders">더보기 →</NuxtLink>
                </div>

                <SiteLoading v-if="leadersPending" />
                <div v-else class="bmc-grid bmc-grid--3">
                    <article v-for="leader in leadersPreview" :key="leader.id" class="bmc-leader-card">
                        <div class="bmc-leader-card__avatar">{{ leader.name.slice(0, 1) }}</div>
                        <div>
                            <p class="bmc-leader-card__role">{{ leader.role }}</p>
                            <h3 class="bmc-leader-card__name">{{ leader.name }}</h3>
                            <span v-if="leader.group !== '전체'" class="bmc-leader-card__group">{{ leader.group }}조</span>
                            <p class="bmc-leader-card__message">{{ leader.message }}</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="bmc-section bmc-section--dark">
            <div class="bmc-section__inner">
                <div class="bmc-section__head">
                    <div>
                        <p class="bmc-section__desc" style="margin-bottom:4px;font-weight:700;color:#dbb94a;">QUICK LINK</p>
                        <h2 class="bmc-section__title">바로가기</h2>
                    </div>
                </div>
                <div class="bmc-grid bmc-grid--4">
                    <NuxtLink class="bmc-link-card" to="/records">
                        <span class="bmc-link-card__icon">📊</span>
                        <strong>전체 기록</strong>
                        <span>타자·투수 누적 기록 확인</span>
                    </NuxtLink>
                    <NuxtLink class="bmc-link-card" to="/mvp">
                        <span class="bmc-link-card__icon">🏆</span>
                        <strong>MVP</strong>
                        <span>월별·주간 MVP 수상자</span>
                    </NuxtLink>
                    <NuxtLink class="bmc-link-card" to="/gallery/team">
                        <span class="bmc-link-card__icon">📷</span>
                        <strong>단체사진</strong>
                        <span>경기·행사 단체사진</span>
                    </NuxtLink>
                    <NuxtLink class="bmc-link-card" to="/news">
                        <span class="bmc-link-card__icon">📰</span>
                        <strong>소식</strong>
                        <span>선교단 최신 소식</span>
                    </NuxtLink>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
type TeamTotal = {
    totalGames: number;
    totalPlayers: number;
    totalHits: number;
    totalRuns: number;
    recentGames?: Array<{
        gameDate: string;
        opponent: string;
        group?: string;
        score?: { our: number; opponent: number };
    }>;
};

type Leader = {
    id: string;
    group: string;
    role: string;
    name: string;
    message: string;
};

definePageMeta({ title: '홈' });

const { fetchJson, getAssetPath } = useBasePath();
const heroStyle = computed(() => ({
    '--bmc-hero-bg': `url('${getAssetPath('images/image_group.jpg')}')`,
}));
const teamLogoUrl = computed(() => getAssetPath('icons/logo.png'));
const teamTotal = ref<TeamTotal | null>(null);
const leaders = ref<Leader[]>([]);
const pending = ref(true);
const leadersPending = ref(true);
const error = ref('');

const recentGame = computed(() => teamTotal.value?.recentGames?.at(-1) ?? null);
const leadersPreview = computed(() => leaders.value.slice(0, 3));

function formatOpponent(opponent: string) {
    return opponent.replace(/-/g, ' ');
}

onMounted(async () => {
    try {
        const [team, leaderData] = await Promise.all([
            fetchJson<TeamTotal>('summary/team-total.json'),
            fetchJson<Leader[]>('meta/leaders.json'),
        ]);
        teamTotal.value = team;
        leaders.value = leaderData;
    } catch (err) {
        error.value = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.';
    } finally {
        pending.value = false;
        leadersPending.value = false;
    }
});
</script>

<style scoped lang="scss">
.bmc-section--dark .bmc-link-card {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);

    strong {
        color: #fff;
    }

    span {
        color: rgba(255, 255, 255, 0.72);
    }

    .bmc-link-card__icon {
        background: rgba(255, 255, 255, 0.1);
    }
}
</style>
