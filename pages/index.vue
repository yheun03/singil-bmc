<template>
    <div class="bmc-home">
        <section class="bmc-hero2" :style="heroStyle">
            <div class="bmc-hero2__bg" aria-hidden="true"></div>
            <div class="bmc-hero2__scan" aria-hidden="true"></div>

            <div class="bmc-hero2__inner">
                <p class="bmc-hero2__eyebrow">
                    <img class="bmc-hero2__mark" :src="teamLogoUrl" alt="" width="40" height="40" />
                    <span>SINGIL CHURCH BASEBALL MISSION · EST. 2024</span>
                </p>
                <h1 class="bmc-hero2__title">
                    <span>ONE TEAM</span>
                    <span class="bmc-hero2__title--accent">ONE FAITH</span>
                </h1>
                <p class="bmc-hero2__sub">신길교회 야구 선교단</p>
                <p class="bmc-hero2__desc">
                    야구를 통해 교제하고, 함께 땀 흘리며, 복음의 가치를 나누는 공동체.
                </p>
                <div class="bmc-hero2__actions">
                    <NuxtLink class="bmc-btn bmc-btn--gold" to="/records">기록 보기</NuxtLink>
                    <NuxtLink class="bmc-btn bmc-btn--ghost-light" to="/videos">영상 보기</NuxtLink>
                </div>
            </div>

            <span class="bmc-hero2__scroll" aria-hidden="true">
                <span>SCROLL</span>
            </span>
        </section>

        <section class="bmc-recordbar">
            <div class="bmc-recordbar__inner">
                <div class="bmc-recordbar__brand">
                    <span class="bmc-recordbar__season">2025–26 SEASON</span>
                    <strong class="bmc-recordbar__team">SINGIL BMC</strong>
                </div>
                <div class="bmc-recordbar__stats">
                    <div class="bmc-recordbar__stat">
                        <span>경기</span><strong>{{ seasonRecord.games }}</strong>
                    </div>
                    <div class="bmc-recordbar__stat">
                        <span>승</span><strong class="is-win">{{ seasonRecord.win }}</strong>
                    </div>
                    <div class="bmc-recordbar__stat">
                        <span>패</span><strong class="is-loss">{{ seasonRecord.loss }}</strong>
                    </div>
                    <div class="bmc-recordbar__stat">
                        <span>무</span><strong>{{ seasonRecord.tie }}</strong>
                    </div>
                    <div class="bmc-recordbar__stat">
                        <span>승률</span><strong>{{ seasonRecord.pct }}</strong>
                    </div>
                    <div class="bmc-recordbar__stat bmc-recordbar__stat--form">
                        <span>최근 5경기</span>
                        <div class="bmc-recordbar__form">
                            <i
                                v-for="(item, idx) in recentForm"
                                :key="idx"
                                class="bmc-recordbar__pill"
                                :class="`is-${item.kind}`"
                                :title="`${item.label} ${item.opponent}`"
                            >{{ item.abbr }}</i>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="bmc-matches">
            <div class="bmc-matches__inner">
                <div class="bmc-matches__head">
                    <div>
                        <h2 class="bmc-matches__title">MATCHES</h2>
                        <p class="bmc-matches__range">최근 경기 결과</p>
                    </div>
                    <NuxtLink class="bmc-matches__more" to="/games">전체 일정 →</NuxtLink>
                </div>

                <SiteLoading v-if="pending" />
                <p v-else-if="error" class="bmc-state bmc-state--error">{{ error }}</p>
                <div v-else-if="matches.length" class="bmc-matches__track">
                    <NuxtLink
                        v-for="(game, idx) in matches"
                        :key="game.gameId || game.gameDate"
                        class="bmc-match-card"
                        :class="`is-${game.kind}`"
                        :to="`/games/${game.gameId}`"
                    >
                        <span v-if="idx === 0" class="bmc-match-card__flag">LATEST</span>
                        <header class="bmc-match-card__top">
                            <strong class="bmc-match-card__date">{{ game.dateLabel }}</strong>
                            <span class="bmc-match-card__weekday">{{ game.weekday }} · {{ game.group || 'A' }}조</span>
                        </header>
                        <div class="bmc-match-card__rows">
                            <div class="bmc-match-card__row">
                                <span class="bmc-match-card__team">SINGIL BMC</span>
                                <span class="bmc-match-card__num">{{ game.score?.our ?? 0 }}</span>
                                <SiteGameResultBadge :kind="game.kind" size="sm" />
                            </div>
                            <div class="bmc-match-card__row bmc-match-card__row--away">
                                <span class="bmc-match-card__team">{{ game.opponentName || formatOpponent(game.opponent) }}</span>
                                <span class="bmc-match-card__num">{{ game.score?.opponent ?? 0 }}</span>
                            </div>
                        </div>
                        <span class="bmc-match-card__cta">결과 보기 →</span>
                    </NuxtLink>
                </div>
            </div>
        </section>

        <section class="bmc-section bmc-section--dark">
            <div class="bmc-section__inner">
                <div class="bmc-section__head">
                    <div>
                        <p class="bmc-section__eyebrow">LEADERS</p>
                        <h2 class="bmc-section__title">운영진</h2>
                    </div>
                    <NuxtLink class="bmc-section__more bmc-section__more--light" to="/about/leaders">더보기 →</NuxtLink>
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
                        <p class="bmc-section__eyebrow">QUICK LINK</p>
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
import {
    gameResultMeta,
    isLossResult,
    isWinResult,
    resolveGameResult,
    type GameResultKind,
} from '~/utils/game-result';

type GameLite = {
    gameId: string;
    gameDate: string;
    opponent: string;
    opponentName?: string;
    group?: string;
    status?: string;
    result?: GameResultKind | null;
    score?: { our: number; opponent: number };
};

type Leader = {
    id: string;
    group: string;
    role: string;
    name: string;
    message: string;
};

definePageMeta({ title: '홈' });

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const { fetchJson, getAssetPath } = useBasePath();
const heroStyle = computed(() => ({
    '--bmc-hero-bg': `url('${getAssetPath('images/image_group.jpg')}')`,
}));
const teamLogoUrl = computed(() => getAssetPath('icons/logo.png'));
const games = ref<GameLite[]>([]);
const leaders = ref<Leader[]>([]);
const pending = ref(true);
const leadersPending = ref(true);
const error = ref('');

/** 결과가 확정된 경기(점수 존재)만, 최신순 정렬 */
const playedGames = computed(() =>
    games.value
        .filter((game) => game.score && (game.score.our != null || game.score.opponent != null))
        .sort((a, b) => b.gameDate.localeCompare(a.gameDate)),
);

const seasonRecord = computed(() => {
    let win = 0;
    let loss = 0;
    let tie = 0;
    for (const game of playedGames.value) {
        const kind = resolveGameResult({ score: game.score, result: game.result });
        if (isWinResult(kind)) win += 1;
        else if (isLossResult(kind)) loss += 1;
        else tie += 1;
    }
    const decided = win + loss;
    const pct = decided ? win / decided : 0;
    return {
        games: playedGames.value.length,
        win,
        loss,
        tie,
        pct: pct.toFixed(3).replace(/^0/, ''),
    };
});

const recentForm = computed(() =>
    playedGames.value.slice(0, 5).map((game) => {
        const kind = resolveGameResult({ score: game.score, result: game.result });
        return {
            kind,
            abbr: gameResultMeta[kind].abbr,
            label: gameResultMeta[kind].label,
            opponent: game.opponentName || formatOpponent(game.opponent),
        };
    }),
);

const matches = computed(() =>
    playedGames.value.slice(0, 6).map((game) => {
        const [, month, day] = game.gameDate.split('-');
        const weekday = WEEKDAYS[new Date(game.gameDate).getDay()] ?? '';
        return {
            ...game,
            kind: resolveGameResult({ score: game.score, result: game.result }),
            dateLabel: `${month}.${day}`,
            weekday: weekday ? `${weekday}요일` : '',
        };
    }),
);

const leadersPreview = computed(() => leaders.value.slice(0, 3));

function formatOpponent(opponent: string) {
    return opponent.replace(/-/g, ' ');
}

onMounted(async () => {
    try {
        const [gameData, leaderData] = await Promise.all([
            fetchJson<GameLite[]>('generated/games.json'),
            fetchJson<Leader[]>('meta/leaders.json'),
        ]);
        games.value = gameData;
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
.bmc-section--dark {
    .bmc-link-card {
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

    // 운영진 카드 다크 변형
    :deep(.bmc-leader-card) {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.12);

        .bmc-leader-card__name {
            color: #fff;
        }

        .bmc-leader-card__message {
            color: rgba(255, 255, 255, 0.68);
        }
    }
}

.bmc-section__more--light {
    color: rgba(255, 255, 255, 0.82);

    &:hover {
        color: #dbb94a;
        text-decoration: none;
    }
}
</style>
