<template>
    <main ref="recapRef" class="bmc-recap" tabindex="0" aria-label="2026 시즌 리캡">
        <div v-if="pending" class="bmc-recap__state" role="status">우리의 시즌을 불러오는 중…</div>
        <div v-else-if="error" class="bmc-recap__state" role="alert">
            <p>시즌 기록을 불러오지 못했습니다.</p>
            <button class="bmc-recap__button" type="button" @click="reload">다시 불러오기</button>
        </div>
        <div v-else-if="!season" class="bmc-recap__state">선교단의 2026년 시즌 기록이 없습니다.</div>
        <Swiper
            v-else
            class="bmc-recap__fullpage"
            :modules="[Mousewheel, Keyboard, A11y, EffectCreative]"
            :effect="reducedMotion ? 'slide' : 'creative'"
            :creative-effect="{
                perspective: true,
                prev: { translate: [0, '-25%', -350], rotate: [12, 0, -4], scale: 0.88, opacity: 0.25 },
                next: { translate: [0, '100%', 0], rotate: [-8, 0, 3], scale: 0.96, opacity: 1 },
            }"
            direction="vertical"
            :slides-per-view="1"
            :speed="reducedMotion ? 0 : 1000"
            :mousewheel="{ forceToAxis: true, thresholdDelta: 30, thresholdTime: 1000 }"
            :keyboard="{ enabled: true, onlyInViewport: true }"
            :touch-start-prevent-default="false"
            no-swiping-class="bmc-recap__section--overflow"
            :a11y="{ containerMessage: '2026 시즌 리캡', slideLabelMessage: '{{index}} / {{slidesLength}}' }"
            @swiper="onSwiper"
            @slide-change="onSlideChange"
        >
            <SwiperSlide tag="section" id="recap-intro" class="bmc-recap__section bmc-recap__section--intro" data-scene="0" :class="{ 'bmc-recap__section--overflow': overflowScenes.includes(0), 'is-visible': visibleScenes.includes(0) }" aria-labelledby="recap-title">
                <div class="bmc-recap__show" aria-hidden="true">
                    <span class="bmc-recap__ghost">OUR SEASON</span>
                    <span class="bmc-recap__shape bmc-recap__shape--one">✦</span>
                    <span class="bmc-recap__shape bmc-recap__shape--two">✳</span>
                    <span class="bmc-recap__disc" />
                    <div class="bmc-recap__equalizer"><span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" /></div>
                    <span v-for="particle in 20" :key="particle" class="bmc-recap__confetti" :style="{ '--i': particle, left: `${(particle * 17) % 100}%`, top: `${(particle * 23) % 95}%` }" />
                </div>
                <div class="bmc-recap__decoration" aria-hidden="true"><span /><span /><span /></div>
                <div class="bmc-recap__viewport" @wheel.capture="onSectionWheel">
                    <div class="bmc-recap__content">
                        <p class="bmc-recap__eyebrow">SINGIL BMC · 전체 기록</p>
                        <p class="bmc-recap__intro">함께 뛰었던 모든 순간</p>
                        <h1 id="recap-title" class="bmc-recap__year">2026<span>RECAP</span></h1>
                        <p class="bmc-recap__copy">그라운드 위에서 쌓아온 우리의 이야기.<br />천천히 아래로 내려보세요.</p>
                        <button class="bmc-recap__button" type="button" @click="goTo(1)">우리의 시즌 만나보기 ↓</button>
                        <p class="bmc-recap__note">2026년 시즌 전체 기록으로 돌아보는 우리의 이야기.</p>
                    </div>
                </div>
                <span class="bmc-recap__scroll" aria-hidden="true">↓</span>
            </SwiperSlide>

            <SwiperSlide tag="section" id="recap-season" class="bmc-recap__section bmc-recap__section--season" data-scene="1" :class="{ 'bmc-recap__section--overflow': overflowScenes.includes(1), 'is-visible': visibleScenes.includes(1) }" aria-labelledby="season-title">
                <div class="bmc-recap__show" aria-hidden="true">
                    <span class="bmc-recap__ghost">PLAY BALL</span>
                    <span class="bmc-recap__shape bmc-recap__shape--one">✦</span>
                    <span class="bmc-recap__shape bmc-recap__shape--two">✳</span>
                    <span class="bmc-recap__disc" />
                    <div class="bmc-recap__equalizer"><span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" /></div>
                    <span v-for="particle in 20" :key="particle" class="bmc-recap__confetti" :style="{ '--i': particle, left: `${(particle * 17) % 100}%`, top: `${(particle * 23) % 95}%` }" />
                </div>
                <div class="bmc-recap__viewport" @wheel.capture="onSectionWheel">
                    <div class="bmc-recap__content">
                        <p class="bmc-recap__eyebrow">01 · OUR SEASON</p>
                        <h2 id="season-title" class="bmc-recap__heading">다시, 그라운드에서.</h2>
                        <p class="bmc-recap__copy">우리가 함께 만들어낸 시즌의 숫자.</p>
                        <div class="bmc-recap__stats">
                            <article v-for="stat in seasonStats" :key="stat.label">
                                <strong :data-count="stat.value">{{ stat.value }}</strong><span>{{ stat.label }}</span>
                            </article>
                        </div>
                        <p class="bmc-recap__copy">{{ playerCount }}명의 선수가 함께 기록을 남겼습니다.</p>
                    </div>
                </div>
            </SwiperSlide>

            <SwiperSlide tag="section" id="recap-batting" class="bmc-recap__section bmc-recap__section--batting" data-scene="2" :class="{ 'bmc-recap__section--overflow': overflowScenes.includes(2), 'is-visible': visibleScenes.includes(2) }" aria-labelledby="batting-title">
                <div class="bmc-recap__show" aria-hidden="true">
                    <span class="bmc-recap__ghost">HIT IT</span>
                    <img class="bmc-recap__shape bmc-recap__shape--one" :src="getAssetPath('images/recap/baseball-ball.svg')" alt="" width="90" height="90" />
                    <img class="bmc-recap__shape bmc-recap__shape--two" :src="getAssetPath('images/recap/color-baseball-bat.svg')" alt="" width="240" height="240" />
                    <span class="bmc-recap__disc" />
                    <div class="bmc-recap__equalizer"><span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" /></div>
                    <span v-for="particle in 20" :key="particle" class="bmc-recap__confetti" :style="{ '--i': particle, left: `${(particle * 17) % 100}%`, top: `${(particle * 23) % 95}%` }" />
                </div>
                <div class="bmc-recap__viewport" @wheel.capture="onSectionWheel">
                    <div class="bmc-recap__content">
                        <p class="bmc-recap__eyebrow">02 · HIT MAKERS</p>
                        <h2 id="batting-title" class="bmc-recap__heading">배트 끝에서 터진 환호.</h2>
                        <div class="bmc-recap__cards">
                            <article v-for="leader in battingLeaders" :key="leader.label" class="bmc-recap__card">
                                <p class="bmc-recap__label">{{ leader.label }}</p>
                                <strong class="bmc-recap__value" :data-count="leader.value">{{ leader.value }}</strong>
                                <p class="bmc-recap__players">{{ leader.names }}</p>
                            </article>
                        </div>
                        <p class="bmc-recap__note">공동 1위 모두 표시 · 동일 등록 선수의 모든 조 기록 합산</p>
                    </div>
                </div>
            </SwiperSlide>

            <SwiperSlide tag="section" id="recap-pitching" class="bmc-recap__section bmc-recap__section--pitching" data-scene="3" :class="{ 'bmc-recap__section--overflow': overflowScenes.includes(3), 'is-visible': visibleScenes.includes(3) }" aria-labelledby="pitching-title">
                <div class="bmc-recap__show" aria-hidden="true">
                    <span class="bmc-recap__ghost">STRIKE</span>
                    <img class="bmc-recap__shape bmc-recap__shape--one" :src="getAssetPath('images/recap/baseball-ball.svg')" alt="" width="90" height="90" />
                    <span class="bmc-recap__shape bmc-recap__shape--two">✳</span>
                    <span class="bmc-recap__disc" />
                    <div class="bmc-recap__equalizer"><span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" /></div>
                    <span v-for="particle in 20" :key="particle" class="bmc-recap__confetti" :style="{ '--i': particle, left: `${(particle * 17) % 100}%`, top: `${(particle * 23) % 95}%` }" />
                </div>
                <div class="bmc-recap__viewport" @wheel.capture="onSectionWheel">
                    <div class="bmc-recap__content">
                        <p class="bmc-recap__eyebrow">03 · ON THE MOUND</p>
                        <h2 id="pitching-title" class="bmc-recap__heading">마운드를 지킨 순간들.</h2>
                        <div class="bmc-recap__cards">
                            <article v-for="leader in pitchingLeaders" :key="leader.label" class="bmc-recap__card">
                                <p class="bmc-recap__label">{{ leader.label }}</p>
                                <strong class="bmc-recap__value">{{ leader.displayValue ?? leader.value }}</strong>
                                <p class="bmc-recap__players">{{ leader.names }}</p>
                            </article>
                        </div>
                        <p class="bmc-recap__note">투구 이닝의 소수점 .1은 ⅓이닝, .2는 ⅔이닝을 뜻합니다.</p>
                    </div>
                </div>
            </SwiperSlide>

            <SwiperSlide tag="section" id="recap-mvp" class="bmc-recap__section bmc-recap__section--mvp" data-scene="4" :class="{ 'bmc-recap__section--overflow': overflowScenes.includes(4), 'is-visible': visibleScenes.includes(4) }" aria-labelledby="mvp-title">
                <div class="bmc-recap__show" aria-hidden="true">
                    <span class="bmc-recap__ghost">ALL STARS</span>
                    <span class="bmc-recap__shape bmc-recap__shape--one">✦</span>
                    <span class="bmc-recap__shape bmc-recap__shape--two">✳</span>
                    <span class="bmc-recap__disc" />
                    <div class="bmc-recap__equalizer"><span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" /></div>
                    <span v-for="particle in 20" :key="particle" class="bmc-recap__confetti" :style="{ '--i': particle, left: `${(particle * 17) % 100}%`, top: `${(particle * 23) % 95}%` }" />
                </div>
                <div class="bmc-recap__viewport" @wheel.capture="onSectionWheel">
                    <div class="bmc-recap__content">
                        <p class="bmc-recap__eyebrow">04 · SEASON MVP</p>
                        <h2 id="mvp-title" class="bmc-recap__heading">올해를 빛낸 주인공.</h2>
                        <p class="bmc-recap__copy">2026년 시즌 전체 기록으로 선정한 MVP.</p>
                        <p v-if="mvpPending" role="status" class="bmc-recap__copy">MVP 기록을 불러오는 중…</p>
                        <p v-else-if="mvpError" class="bmc-recap__copy">MVP 기록을 불러오지 못했습니다. <button class="bmc-recap__text-button" @click="reloadMvp">다시 불러오기</button></p>
                        <div v-else class="bmc-recap__cards bmc-recap__cards--two">
                            <article v-for="panel in seasonMvps" :key="panel.label" class="bmc-recap__card">
                                <p class="bmc-recap__label">{{ panel.label }}</p>
                                <p class="bmc-recap__trophy" aria-hidden="true">✦</p>
                                <h3 class="bmc-recap__players">{{ panel.entry?.name ?? '기록 없음' }}</h3>
                                <p class="bmc-recap__detail">{{ panel.entry?.summary ?? 'MVP를 산정할 기록이 없습니다.' }}</p>
                                <p v-if="panel.entry" class="bmc-recap__note">MVP 점수 {{ panel.entry.stats?.score }}</p>
                            </article>
                        </div>
                        <p class="bmc-recap__note">기존 MVP 점수 기준 자동 산정 · 동점 정렬 기준도 MVP 페이지와 동일합니다.</p>
                    </div>
                </div>
            </SwiperSlide>

            <SwiperSlide tag="section" id="recap-awards" class="bmc-recap__section bmc-recap__section--awards" data-scene="5" :class="{ 'bmc-recap__section--overflow': overflowScenes.includes(5), 'is-visible': visibleScenes.includes(5) }" aria-labelledby="awards-title">
                <div class="bmc-recap__show" aria-hidden="true">
                    <span class="bmc-recap__ghost">ON REPEAT</span>
                    <span class="bmc-recap__shape bmc-recap__shape--one">✦</span>
                    <span class="bmc-recap__shape bmc-recap__shape--two">✳</span>
                    <span class="bmc-recap__disc" />
                    <div class="bmc-recap__equalizer"><span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" /></div>
                    <span v-for="particle in 20" :key="particle" class="bmc-recap__confetti" :style="{ '--i': particle, left: `${(particle * 17) % 100}%`, top: `${(particle * 23) % 95}%` }" />
                </div>
                <div class="bmc-recap__viewport" @wheel.capture="onSectionWheel">
                    <div class="bmc-recap__content">
                        <p class="bmc-recap__eyebrow">05 · AGAIN AND AGAIN</p>
                        <h2 id="awards-title" class="bmc-recap__heading">한 번을 넘어, 꾸준히.</h2>
                        <p class="bmc-recap__copy">가장 많이 MVP 1위에 오른 선수.</p>
                        <p v-if="mvpPending" role="status" class="bmc-recap__copy">MVP 기록을 불러오는 중…</p>
                        <p v-else-if="mvpError" class="bmc-recap__copy">MVP 기록을 불러오지 못했습니다.</p>
                        <div v-else class="bmc-recap__cards bmc-recap__cards--two">
                            <article v-for="award in frequentMvps" :key="award.label" class="bmc-recap__card">
                                <p class="bmc-recap__label">{{ award.label }}</p>
                                <strong class="bmc-recap__value">{{ award.count }}<small>회</small></strong>
                                <p class="bmc-recap__players">{{ award.names }}</p>
                            </article>
                        </div>
                        <p class="bmc-recap__note">2026년 모든 조의 타자·투수 1위 횟수 합산<br />같은 기간에 두 부문 또는 두 조에서 1위이면 각각 1회로 집계합니다. 공동 최다 모두 표시.</p>
                    </div>
                </div>
            </SwiperSlide>

            <SwiperSlide tag="section" id="recap-records" class="bmc-recap__section bmc-recap__section--records" data-scene="6" :class="{ 'bmc-recap__section--overflow': overflowScenes.includes(6), 'is-visible': visibleScenes.includes(6) }" aria-labelledby="records-title">
                <div class="bmc-recap__show" aria-hidden="true">
                    <span class="bmc-recap__ghost">LEVEL UP</span>
                    <span class="bmc-recap__shape bmc-recap__shape--one">✦</span>
                    <span class="bmc-recap__shape bmc-recap__shape--two">✳</span>
                    <span class="bmc-recap__disc" />
                    <div class="bmc-recap__equalizer"><span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" /></div>
                    <span v-for="particle in 20" :key="particle" class="bmc-recap__confetti" :style="{ '--i': particle, left: `${(particle * 17) % 100}%`, top: `${(particle * 23) % 95}%` }" />
                </div>
                <div class="bmc-recap__viewport" @wheel.capture="onSectionWheel">
                    <div class="bmc-recap__content">
                        <p class="bmc-recap__eyebrow">06 · BEYOND LAST YEAR</p>
                        <h2 id="records-title" class="bmc-recap__heading">어제의 나를 넘어.</h2>
                        <p class="bmc-recap__copy">2025년 전체 기록을 넘어선 2026년 개인 기록.</p>
                        <div v-if="personalBests.length" class="bmc-recap__records">
                            <article v-for="record in personalBests" :key="`${record.playerId}-${record.label}`" class="bmc-recap__record">
                                <div><h3>{{ record.name }}</h3><p>{{ record.label }} 작년 기록 돌파</p></div>
                                <p><span><small>2025</small>{{ record.previous }}</span><span aria-hidden="true"> → </span><strong><small>2026</small>{{ record.value }}</strong></p>
                            </article>
                        </div>
                        <p v-else class="bmc-recap__copy">작년 기록을 넘어선 개인 기록은 없습니다.</p>
                        <p class="bmc-recap__note">2025년과 2026년 시즌 전체 기록 비교 · 모든 조 기록 합산<br />안타·타점·도루·탈삼진 기준, 증가 폭이 큰 순서로 표시.<br />2025년 기록이 없는 선수는 비교에서 제외합니다.</p>
                    </div>
                </div>
            </SwiperSlide>

            <SwiperSlide tag="section" id="recap-together" class="bmc-recap__section bmc-recap__section--together" data-scene="7" :class="{ 'bmc-recap__section--overflow': overflowScenes.includes(7), 'is-visible': visibleScenes.includes(7) }" aria-labelledby="together-title">
                <div class="bmc-recap__show" aria-hidden="true">
                    <span class="bmc-recap__ghost">SEE YOU</span>
                    <span class="bmc-recap__shape bmc-recap__shape--one">✦</span>
                    <span class="bmc-recap__shape bmc-recap__shape--two">✳</span>
                    <span class="bmc-recap__disc" />
                    <div class="bmc-recap__equalizer"><span v-for="bar in 12" :key="bar" :style="{ '--bar': bar }" /></div>
                    <span v-for="particle in 20" :key="particle" class="bmc-recap__confetti" :style="{ '--i': particle, left: `${(particle * 17) % 100}%`, top: `${(particle * 23) % 95}%` }" />
                </div>
                <div class="bmc-recap__decoration" aria-hidden="true"><span /><span /><span /></div>
                <div class="bmc-recap__viewport" @wheel.capture="onSectionWheel">
                    <div class="bmc-recap__content">
                        <p class="bmc-recap__eyebrow">07 · MADE TOGETHER</p>
                        <h2 id="together-title" class="bmc-recap__heading">우리의 2026,<br />함께 만든 기록.</h2>
                        <p class="bmc-recap__copy">선교단의 모든 선수에게 박수를 보냅니다.<br />다음 순간도 함께 만들어가요.</p>
                        <div class="bmc-recap__actions">
                            <button class="bmc-recap__button" type="button" @click="goTo(0)">처음부터 다시 보기 ↑</button>
                            <NuxtLink class="bmc-recap__link" to="/records/yearly">시즌 기록 자세히 보기 ↗</NuxtLink>
                        </div>
                        <NuxtLink class="bmc-recap__link bmc-recap__home" to="/">신길교회 야구 선교단 홈으로</NuxtLink>
                        <p class="bmc-recap__note">야구공: <a href="https://github.com/twitter/twemoji/blob/master/assets/svg/26be.svg" target="_blank" rel="noopener noreferrer">Twemoji / Twitter</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a><br />컬러 야구 배트: <a href="https://www.svgrepo.com/svg/193625/baseball-bat" target="_blank" rel="noopener noreferrer">SVG Repo · CC0</a></p>
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>
        <div v-if="season && !pending && !error" class="bmc-recap__pager" aria-label="화면 이동">
            <button type="button" :disabled="activeScene === 0" @click="goTo(activeScene - 1)">↑ 이전</button>
            <span>{{ activeScene + 1 }} / {{ sectionLabels.length }}</span>
            <button type="button" :disabled="activeScene === sectionLabels.length - 1" @click="goTo(activeScene + 1)">다음 ↓</button>
        </div>
        <nav v-if="season && !pending && !error" class="bmc-recap__navigation" aria-label="리캡 섹션 이동">
            <button v-for="(item, index) in sectionLabels" :key="item" type="button" :aria-label="item" :aria-current="activeScene === index ? 'step' : undefined" :class="{ 'is-active': activeScene === index }" @click="goTo(index)"><span>{{ item }}</span></button>
        </nav>
    </main>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Mousewheel, Keyboard, A11y, EffectCreative } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import 'swiper/css/a11y';
import 'swiper/css/effect-creative';
import { buildPeriodRecordView, type PeriodRecordSlice } from '~/utils/record-aggregate';
import { buildMvpPeriodBlocks, type MvpBoardEntry } from '~/utils/mvp-display';

definePageMeta({ title: '2026 RECAP', layout: false });
setSeoPageOverride({
    title: '2026 RECAP — 함께 만든 우리의 시즌',
    description: '신길교회 야구 선교단의 2026년 이야기. 전체 시즌 기록, MVP와 작년을 넘어선 개인 기록을 만나보세요.',
    path: '/recap/2026', image: '/images/recap-2026-og.png', noindex: false,
});
useHead({ meta: [{ key: 'og-image-alt', property: 'og:image:alt', content: '2026 RECAP · SINGIL BMC · 함께 만든 우리의 시즌' }] });

const { data, pending, error, reload } = useSiteData<Array<PeriodRecordSlice & { year: number }>>('summary/yearly-records.json');
const yearlyMvp = useSiteData<MvpBoardEntry[]>('summary/mvp-yearly.json');
const monthlyMvp = useSiteData<MvpBoardEntry[]>('summary/mvp-monthly.json');
const weeklyMvp = useSiteData<MvpBoardEntry[]>('summary/mvp-weekly.json');
const mvpPending = computed(() => yearlyMvp.pending.value || monthlyMvp.pending.value || weeklyMvp.pending.value);
const mvpError = computed(() => yearlyMvp.error.value || monthlyMvp.error.value || weeklyMvp.error.value);
function reloadMvp() { return Promise.all([yearlyMvp.reload(), monthlyMvp.reload(), weeklyMvp.reload()]); }
const { getAssetPath } = useBasePath();
const recapRef = ref<HTMLElement | null>(null);
const activeScene = ref(0);
const sectionLabels = ['시작', '시즌 요약', '타자 기록', '투수 기록', '시즌 MVP', '최다 MVP', '개인 기록 돌파', '함께 만든 시즌'];
const currentRecord = computed(() => data.value?.find((item) => item.year === 2026) ?? null);
const season = computed(() => buildPeriodRecordView(currentRecord.value, 'all'));
const seasonStats = computed(() => [
    { label: '경기', value: season.value?.games ?? 0 },
    { label: '안타', value: season.value?.hits ?? 0 },
    { label: '득점', value: season.value?.runs ?? 0 },
]);
const playerCount = computed(() => new Set([...(season.value?.batting ?? []), ...(season.value?.pitching ?? [])].map((row) => row.playerId || row.name)).size);

function findLeader(rows: Array<{ name: string; value: number }>, label: string) {
    const value = Math.max(0, ...rows.map((row) => row.value));
    return { label, value, names: value > 0 ? rows.filter((row) => row.value === value).map((row) => row.name).join(', ') : '기록 없음' };
}
const battingLeaders = computed(() => {
    const rows = season.value?.batting ?? [];
    return [
        findLeader(rows.map((row) => ({ name: String(row.name), value: Number(row.h) })), '최다 안타'),
        findLeader(rows.map((row) => ({ name: String(row.name), value: Number(row.rbi) })), '최다 타점'),
        findLeader(rows.map((row) => ({ name: String(row.name), value: Number(row.sb) })), '최다 도루'),
    ];
});
const pitchingLeaders = computed(() => {
    const rows = season.value?.pitching ?? [];
    const innings = findLeader(rows.map((row) => ({ name: String(row.name), value: Number(row.outs) })), '최다 투구 이닝');
    return [
        { ...findLeader(rows.map((row) => ({ name: String(row.name), value: Number(row.so) })), '최다 탈삼진'), displayValue: undefined },
        { ...findLeader(rows.map((row) => ({ name: String(row.name), value: Number(row.win) })), '최다 승리'), displayValue: undefined },
        { ...innings, displayValue: `${Math.floor(innings.value / 3)}.${innings.value % 3}` },
    ];
});
const seasonMvps = computed(() => {
    const block = buildMvpPeriodBlocks(
        (yearlyMvp.data.value ?? []).filter((item) => item.key === '2026'), 'yearly', 'all', ['A', 'D'],
        currentRecord.value ? { '2026': currentRecord.value } : {},
    )[0]?.groups[0];
    return [
        { label: '타자 MVP', entry: block?.batting.find((item) => item.rank === 1) },
        { label: '투수 MVP', entry: block?.pitching.find((item) => item.rank === 1) },
    ];
});
function countAwards(items: MvpBoardEntry[], label: string) {
    const counts = new Map<string, number>();
    for (const item of items) {
        if (!item.key.startsWith('2026-') || item.rank !== 1 || !['batting', 'pitching'].includes(item.type)) continue;
        counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
    }
    const count = Math.max(0, ...counts.values());
    return { label, count, names: count ? [...counts].filter(([, value]) => value === count).map(([name]) => name).join(', ') : '수상 기록 없음' };
}
const frequentMvps = computed(() => [countAwards(monthlyMvp.data.value ?? [], '월간 MVP 최다 1위'), countAwards(weeklyMvp.data.value ?? [], '주간 MVP 최다 1위')]);
const previousSeason = computed(() => buildPeriodRecordView(data.value?.find((item) => item.year === 2025) ?? null, 'all'));
const personalBests = computed(() => {
    const previous = previousSeason.value;
    if (!previous) return [];
    const result: Array<{ playerId: string; name: string; label: string; previous: number; value: number }> = [];
    const metrics = [
        { kind: 'batting' as const, field: 'h', label: '안타' },
        { kind: 'batting' as const, field: 'rbi', label: '타점' },
        { kind: 'batting' as const, field: 'sb', label: '도루' },
        { kind: 'pitching' as const, field: 'so', label: '탈삼진' },
    ];
    for (const metric of metrics) {
        for (const row of season.value?.[metric.kind] ?? []) {
            const earlier = previous[metric.kind].find((item) => item.playerId && item.playerId === row.playerId);
            if (!earlier) continue;
            const previousValue = Number((earlier as unknown as Record<string, unknown>)[metric.field]) || 0;
            const value = Number((row as unknown as Record<string, unknown>)[metric.field]) || 0;
            if (value > previousValue) result.push({ playerId: String(row.playerId), name: String(row.name), label: metric.label, previous: previousValue, value });
        }
    }
    return result.sort((a, b) => (b.value - b.previous) - (a.value - a.previous) || a.name.localeCompare(b.name, 'ko'));
});

let fullpage: SwiperInstance | null = null;
let resizeObserver: ResizeObserver | null = null;
const reducedMotion = ref(false);
const overflowScenes = ref<number[]>([]);
const visibleScenes = ref<number[]>([]);
const frames = new Set<number>();
function prefersReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function goTo(index: number) {
    fullpage?.slideTo(index, prefersReducedMotion() ? 0 : 1000);
}
function animateCounts(section: HTMLElement) {
    if (prefersReducedMotion()) return;
    section.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => {
        const target = Number(element.dataset.count);
        const start = performance.now();
        function tick(now: number) {
            const progress = Math.min((now - start) / 1000, 1);
            element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) {
                const id = requestAnimationFrame((time) => { frames.delete(id); tick(time); });
                frames.add(id);
            }
        }
        tick(start);
    });
}
function onSectionWheel(event: WheelEvent) {
    const section = event.currentTarget as HTMLElement;
    const canScrollDown = section.scrollTop + section.clientHeight < section.scrollHeight - 2;
    const canScrollUp = section.scrollTop > 2;
    if ((event.deltaY > 0 && canScrollDown) || (event.deltaY < 0 && canScrollUp)) {
        // 긴 섹션을 읽는 동안에는 Swiper의 화면 전환을 잠시 막습니다.
        event.stopPropagation();
    }
}
function onSlideChange(instance: SwiperInstance) {
    activeScene.value = instance.activeIndex;
    instance.slides.forEach((slide, index) => {
        slide.inert = index !== instance.activeIndex;
    });
    const section = instance.slides[instance.activeIndex];
    if (section && !visibleScenes.value.includes(instance.activeIndex)) {
        visibleScenes.value.push(instance.activeIndex);
        nextTick(() => animateCounts(section));
    }
}
async function onSwiper(instance: SwiperInstance) {
    fullpage = instance;
    await nextTick();
    if (instance.destroyed) return;
    onSlideChange(instance);
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(() => {
        overflowScenes.value = instance.slides.flatMap((slide, index) => {
            const content = slide.querySelector<HTMLElement>('.bmc-recap__content');
            const viewport = slide.querySelector<HTMLElement>('.bmc-recap__viewport');
            return content && viewport && content.offsetHeight + parseFloat(getComputedStyle(viewport).paddingTop) + parseFloat(getComputedStyle(viewport).paddingBottom) > viewport.clientHeight + 2 ? [index] : [];
        });
    });
    instance.slides.forEach((slide) => {
        resizeObserver?.observe(slide);
        const viewport = slide.querySelector('.bmc-recap__viewport');
        if (viewport) resizeObserver?.observe(viewport);
        const content = slide.querySelector('.bmc-recap__content');
        if (content) resizeObserver?.observe(content);
    });
}
onMounted(() => {
    reducedMotion.value = prefersReducedMotion();
});
onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    fullpage = null;
    frames.forEach(cancelAnimationFrame);
    setSeoPageOverride(null);
});
</script>

<style scoped lang="scss">
@use "~/assets/scss/site/tokens" as *;

.bmc-recap {
    --recap-bg: #fbfaf5;
    --recap-text: #16251b;
    --recap-muted: #46584c;
    --recap-accent: #245a2b;
    --recap-card: #ffffffd9;
    --recap-border: #163d242b;
    --recap-controls: #fffffff2;
    height: 100dvh;
    overflow-y: hidden;
    overflow-x: hidden;
    overscroll-behavior-y: contain;
    color: var(--recap-text);
    background: var(--recap-bg);
    font-family: 'Pretendard', sans-serif;
    line-height: 1.5;
    color-scheme: light;

    button { font: inherit; cursor: pointer; }
    button, a { -webkit-tap-highlight-color: transparent; }
    button:focus-visible, a:focus-visible { outline: 3px solid var(--recap-accent); outline-offset: 5px; }
    &__fullpage { height: 100%; width: 100%; }
    &__section { position: relative; isolation: isolate; height: 100%; box-sizing: border-box; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; overflow: hidden; }
    &__section { --scene-color: #8eda35; --scene-ink: #25510a; background: color-mix(in srgb, var(--scene-color) 23%, var(--recap-bg)); }
    &__section--season { --scene-color: #83b8ff; --scene-ink: #214b92; }
    &__section--batting { --scene-color: #ff91ce; --scene-ink: #8d205e; }
    &__section--pitching { --scene-color: #b69aff; --scene-ink: #59309a; }
    &__section--mvp { --scene-color: #ffc943; --scene-ink: #785008; }
    &__section--awards { --scene-color: #ff9775; --scene-ink: #903717; }
    &__section--records { --scene-color: #56d9c1; --scene-ink: #166d5d; }
    &__section--together { --scene-color: #c2f63c; --scene-ink: #46600c; }
    &__section { --recap-accent: var(--scene-ink); }
    &__viewport { width: 100%; height: 100%; min-height: 0; display: flex; flex-direction: column; align-items: center; overflow-y: auto; overflow-x: hidden; overscroll-behavior-y: contain; scrollbar-gutter: stable; padding: 36px clamp(24px, 7vw, 100px) 100px; box-sizing: border-box; }
    &__content { width: min(100%, 1060px); flex-shrink: 0; margin-block: auto; padding-block: 8px 20px; text-align: center; }
    &__section--intro &__copy { margin: 20px 0; }
    &__section--intro &__note { margin-top: 16px; }
    &__section.swiper-slide-active &__content > * { animation: recap-reveal 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
    &__section.swiper-slide-active &__content > :nth-child(2) { animation-delay: 0.12s; }
    &__section.swiper-slide-active &__content > :nth-child(3) { animation-delay: 0.24s; }
    &__section.swiper-slide-active &__content > :nth-child(4) { animation-delay: 0.36s; }
    &__section.swiper-slide-active &__content > :nth-child(5) { animation-delay: 0.44s; }
    &__eyebrow { color: var(--recap-accent); font-size: 15px; letter-spacing: 0.14em; font-weight: 800; margin: 0 0 24px; }
    &__intro { font-size: clamp(20px, 3vw, 30px); margin: 0 0 20px; }
    &__year { font-family: $bmc-font-display-alt; font-size: clamp(80px, min(18vw, 18svh), 180px); line-height: 0.95; letter-spacing: -0.07em; margin: 0; color: var(--recap-accent); transform: rotate(-4deg); }
    &__year span { display: block; font-size: 0.46em; letter-spacing: -0.03em; margin-top: 16px; color: var(--recap-text); }
    &__heading { margin: 0; font-size: clamp(34px, 5vw, 64px); font-weight: 900; line-height: 1.25; letter-spacing: -0.04em; word-break: keep-all; }
    &__copy { margin: 28px 0; color: var(--recap-muted); font-size: clamp(18px, 2vw, 23px); line-height: 1.75; word-break: keep-all; }
    &__note a { color: inherit; text-underline-offset: 3px; }
    &__note { color: var(--recap-muted); font-size: 16px; line-height: 1.7; margin: 24px 0 0; word-break: keep-all; }
    &__button { display: inline-flex; justify-content: center; align-items: center; min-height: 54px; padding: 16px 28px; border: 0; border-radius: 999px; background: var(--recap-accent); color: var(--recap-bg); font-weight: 800; font-size: 18px; transition: transform 0.2s; }
    &__button:hover { transform: translateY(-3px); }
    &__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 40px 0; }
    &__stats strong { display: block; font-family: $bmc-font-display-alt; font-size: clamp(54px, 9vw, 120px); color: var(--recap-accent); line-height: 1.2; }
    &__stats span { display: block; margin-top: 12px; font-size: 22px; }
    &__cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
    &__cards--two { grid-template-columns: repeat(2, 1fr); }
    &__card { border: 1px solid var(--recap-border); background: var(--recap-card); border-radius: 28px; padding: 32px 24px; transition: transform 0.25s; }
    &__card:hover { transform: translateY(-6px); }
    &__label { font-size: 20px; font-weight: 700; margin: 0 0 20px; }
    &__value { display: block; color: var(--recap-accent); font-size: clamp(48px, 6vw, 76px); font-family: $bmc-font-display-alt; line-height: 1.2; }
    &__value small { font: 22px 'Pretendard', sans-serif; margin-left: 8px; }
    &__players { font-size: clamp(24px, 3vw, 34px); font-weight: 900; margin: 24px 0 0; overflow-wrap: anywhere; }
    &__detail { color: var(--recap-muted); font-size: 18px; line-height: 1.6; margin: 18px 0 0; }
    &__trophy { color: var(--recap-accent); font-size: 76px; line-height: 1; margin: 0; animation: recap-glow 4s ease-in-out infinite; }
    &__records { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 32px; }
    &__record { display: flex; align-items: center; justify-content: space-between; gap: 20px; text-align: left; padding: 24px; border-radius: 20px; border: 1px solid var(--recap-border); background: var(--recap-card); }
    &__record h3 { font-size: 23px; margin: 0; }
    &__record p { margin: 4px 0 0; font-size: 17px; }
    &__record > p { white-space: nowrap; font-size: 22px; }
    &__record > p > span:first-child, &__record strong { display: inline-block; text-align: center; }
    &__record small { display: block; font-size: 13px; font-weight: 500; color: var(--recap-muted); }
    &__record strong { color: var(--recap-accent); font-size: 32px; }
    &__actions { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 28px; margin-top: 40px; }
    &__link { display: inline-flex; align-items: center; min-height: 48px; color: var(--recap-text); font-size: 18px; text-underline-offset: 6px; }
    &__home { margin-top: 32px; }
    &__text-button { background: transparent; border: 0; text-decoration: underline; color: var(--recap-accent); min-height: 48px; }
    &__decoration { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
    &__decoration span { position: absolute; border-radius: 50%; width: min(65vw, 780px); aspect-ratio: 1; border: 1px solid var(--recap-border); top: 50%; left: 50%; translate: -50% -50%; animation: recap-orbit 12s ease-in-out infinite alternate; }
    &__decoration span:nth-child(2) { width: min(80vw, 960px); animation-delay: -4s; }
    &__decoration span:nth-child(3) { width: min(95vw, 1140px); animation-delay: -8s; }
    &__scroll { position: absolute; bottom: 80px; left: 50%; font-size: 30px; color: var(--recap-accent); animation: recap-bounce 2s ease-in-out infinite; }
    &__navigation { position: fixed; right: 12px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; z-index: 4; }
    &__navigation button { position: relative; width: 44px; height: 44px; border: 0; background: transparent; }
    &__navigation button::after { content: ''; display: block; width: 8px; height: 8px; border-radius: 50%; margin: auto; background: var(--recap-muted); opacity: 0.5; transition: transform 0.3s; }
    &__navigation .is-active::after { background: var(--recap-accent); opacity: 1; transform: scale(1.6); }
    &__navigation span { position: absolute; right: 44px; top: 8px; white-space: nowrap; background: var(--recap-controls); border-radius: 8px; padding: 4px 12px; color: var(--recap-text); opacity: 0; pointer-events: none; }
    &__navigation button:hover span, &__navigation button:focus-visible span { opacity: 1; }
    &__pager { position: fixed; z-index: 5; bottom: max(12px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 20px; border: 1px solid var(--recap-border); border-radius: 999px; padding: 4px 12px; background: var(--recap-controls); white-space: nowrap; }
    &__pager button { min-height: 44px; padding: 8px 14px; border: 0; background: transparent; color: var(--recap-text); font-weight: 700; }
    &__pager button:disabled { opacity: 0.4; cursor: default; }
    &__pager span { font-size: 14px; color: var(--recap-muted); }
    &__show { position: absolute; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; contain: strict; }
    &__ghost { position: absolute; left: -4%; top: 12%; width: 160%; font-family: $bmc-font-display-alt; font-size: clamp(100px, 21vw, 320px); line-height: 1; white-space: nowrap; color: transparent; -webkit-text-stroke: 2px var(--recap-accent); opacity: 0.09; transform: rotate(-12deg); animation: recap-marquee 22s linear infinite alternate; }
    &__shape { position: absolute; font-size: clamp(200px, 40vw, 580px); line-height: 1; color: var(--scene-color); opacity: 0.38; animation: recap-spin 35s linear infinite; }
    &__shape--one { top: -12%; right: -12%; }
    &__shape--two { bottom: -16%; left: -12%; animation-direction: reverse; font-size: clamp(160px, 30vw, 420px); opacity: 0.25; }
    &__disc { position: absolute; width: min(38vw, 480px); aspect-ratio: 1; right: -12%; top: 36%; border-radius: 50%; border: 28px solid color-mix(in srgb, var(--scene-color) 35%, transparent); box-shadow: 0 0 0 22px color-mix(in srgb, var(--scene-color) 12%, transparent), 0 0 0 54px color-mix(in srgb, var(--scene-color) 8%, transparent); animation: recap-disc 6s ease-in-out infinite; }
    &__equalizer { position: absolute; left: -2%; bottom: -2%; display: flex; align-items: flex-end; gap: 12px; width: 50%; height: 24%; opacity: 0.13; transform: rotate(-8deg); }
    &__equalizer span { flex: 1; height: 100%; border-radius: 20px 20px 0 0; background: var(--recap-accent); transform-origin: bottom; animation: recap-beat calc(0.8s + var(--bar) * 0.07s) calc(var(--bar) * -0.2s) ease-in-out infinite alternate; }
    &__confetti { position: absolute; width: 8px; height: 18px; border-radius: 2px; background: var(--recap-accent); opacity: 0.15; rotate: calc(var(--i) * 25deg); animation: recap-confetti calc(6s + var(--i) * 0.12s) calc(var(--i) * -0.4s) ease-in-out infinite; }
    &__confetti:nth-of-type(3n) { border-radius: 50%; width: 12px; height: 12px; background: var(--scene-color); }
    &__show *, &__decoration span, &__trophy { animation-play-state: paused; }
    &__section.swiper-slide-active &__show *, &__section.swiper-slide-active &__decoration span, &__section.swiper-slide-active &__trophy { animation-play-state: running; }
    &__section.swiper-slide-active &__card, &__section.swiper-slide-active &__record { animation: recap-card-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) both; }
    &__section.swiper-slide-active &__card:nth-child(2), &__section.swiper-slide-active &__record:nth-child(2n) { animation-delay: 0.18s; }
    &__section.swiper-slide-active &__card:nth-child(3), &__section.swiper-slide-active &__record:nth-child(3n) { animation-delay: 0.32s; }
    &__card { position: relative; border: 2px solid color-mix(in srgb, var(--recap-accent) 22%, transparent); box-shadow: 8px 10px 0 color-mix(in srgb, var(--scene-color) 28%, transparent); }
    &__card:hover { transform: translateY(-8px) rotate(-2deg); }
    &__stats strong { text-shadow: 4px 5px 0 color-mix(in srgb, var(--scene-color) 45%, transparent); }
    &__section.swiper-slide-active &__stats article { animation: recap-number-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) both; }
    &__stats article:nth-child(2) { animation-delay: 0.12s !important; }
    &__stats article:nth-child(3) { animation-delay: 0.24s !important; }
    &__heading { text-shadow: 2px 3px 0 color-mix(in srgb, var(--scene-color) 35%, transparent); }
    &__year span { -webkit-text-stroke: 1px var(--recap-text); text-shadow: 5px 6px 0 var(--scene-color); }
    &__eyebrow { display: inline-block; padding: 8px 18px; border: 1px solid var(--recap-accent); border-radius: 999px; background: var(--recap-card); }
    &__button { box-shadow: 5px 6px 0 color-mix(in srgb, var(--recap-accent) 25%, transparent); }
    // 장면의 내용에 맞춘 그래픽과 등장 동작
    &__section--intro.swiper-slide-active &__year { animation: recap-title-stamp 1.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
    &__section--season &__shape, &__section--season &__disc { display: none; }
    &__section--season &__equalizer { width: 100%; height: 35%; opacity: 0.18; transform: none; }
    &__section--season.swiper-slide-active &__stats article { animation-name: recap-scoreboard; }
    &__section--batting &__shape--one, &__section--pitching &__shape--one { width: 90px; height: 90px; font-size: 0; border-radius: 50%; object-fit: contain; background: none; border: 0; opacity: 0.75; }
    &__section--batting &__shape--one { top: 30%; right: 8%; animation: recap-hit-ball 5s cubic-bezier(0.2, 0.7, 0.3, 1) infinite; }
    &__section--batting &__shape--two { font-size: 0; width: clamp(160px, 22vw, 280px); height: auto; aspect-ratio: 1; left: 5%; bottom: 10%; object-fit: contain; border-radius: 0; background: none; opacity: 0.8; filter: drop-shadow(5px 8px 0 #bf56851a); transform-origin: 15% 85%; animation: recap-bat-swing 5s ease-in-out infinite; }
    &__section--batting &__disc, &__section--batting &__equalizer { display: none; }
    &__section--batting.swiper-slide-active &__card { animation-name: recap-hit-card; }
    &__section--pitching &__shape--one { top: 24%; left: 4%; right: auto; animation: recap-pitch-ball 4.8s cubic-bezier(0.6, 0.05, 0.1, 1) infinite; }
    &__section--pitching &__shape--two, &__section--pitching &__equalizer { display: none; }
    &__section--pitching &__disc { right: 7%; top: 20%; width: min(24vw, 300px); border-width: 5px; animation: recap-target 4.8s ease-out infinite; }
    &__section--pitching.swiper-slide-active &__card { animation-name: recap-strike-card; }
    &__section--mvp &__show::before { content: ''; position: absolute; inset: -80%; background: conic-gradient(from 0deg, transparent 0deg 25deg, #f5bb4230 25deg 40deg, transparent 40deg 75deg, #f5bb4230 75deg 90deg, transparent 90deg 180deg, #f5bb4220 180deg 210deg, transparent 210deg); animation: recap-spin 40s linear infinite; animation-play-state: paused; }
    &__section--mvp.swiper-slide-active &__show::before { animation-play-state: running; }
    &__section--mvp &__disc, &__section--mvp &__equalizer, &__section--mvp &__shape { display: none; }
    &__section--mvp.swiper-slide-active &__card { animation-name: recap-podium; animation-duration: 1.4s; }
    &__section--mvp &__trophy { animation: recap-crown 5s ease-in-out infinite; }
    &__section--awards &__disc { border-style: dashed; animation: recap-spin 18s linear infinite; }
    &__section--awards &__equalizer, &__section--awards &__shape--two { display: none; }
    &__section--awards.swiper-slide-active &__card { animation-name: recap-award-flip; }
    &__section--records &__shape, &__section--records &__disc, &__section--records &__equalizer { display: none; }
    &__section--records &__ghost { animation: recap-level-up 10s ease-in-out infinite; }
    &__record { position: relative; overflow: hidden; padding-bottom: 30px; }
    &__record::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 5px; background: var(--recap-accent); transform-origin: left; }
    &__section--records.swiper-slide-active &__record { animation-name: recap-record-rise; }
    &__section--records.swiper-slide-active &__record::after { animation: recap-growth 1.8s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    &__section--together &__equalizer, &__section--together &__disc { display: none; }
    &__section--together &__confetti { width: 12px; height: 24px; opacity: 0.4; animation: recap-celebrate calc(7s + var(--i) * 0.12s) calc(var(--i) * -0.4s) linear infinite; }
    &__section--together.swiper-slide-active &__heading { animation-name: recap-finale; animation-duration: 1.4s; }
    &__section:not(.swiper-slide-active) &__show *, &__section:not(.swiper-slide-active) &__show::before, &__section:not(.swiper-slide-active) &__trophy { animation-play-state: paused; }
    &__state { min-height: 100svh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 110px 24px 48px; font-size: 20px; text-align: center; }
}
@keyframes recap-title-stamp { from { opacity: 0; transform: scale(2.1) rotate(-18deg); } 65% { opacity: 1; transform: scale(0.94) rotate(2deg); } to { transform: scale(1) rotate(-4deg); } }
@keyframes recap-scoreboard { from { opacity: 0; transform: translateY(-65px) rotateX(75deg); } to { opacity: 1; transform: translateY(0) rotateX(0); } }
@keyframes recap-hit-ball { 0%, 15% { opacity: 0; transform: translate(-25vw, 20vh) scale(0.2); } 30% { opacity: 0.75; transform: translate(-15vw, 8vh) scale(1); } 65%, 100% { opacity: 0; transform: translate(20vw, -30vh) scale(1.5) rotate(300deg); } }
@keyframes recap-bat-swing { 0%, 15%, 70%, 100% { transform: rotate(-30deg); } 30% { transform: rotate(65deg); } }
@keyframes recap-hit-card { from { opacity: 0; transform: translateX(-120px) rotate(-12deg); } to { opacity: 1; transform: translateX(0) rotate(0); } }
@keyframes recap-pitch-ball { 0%, 15% { opacity: 0; transform: translateX(0) scale(1.3); } 25% { opacity: 0.75; } 55%, 100% { opacity: 0; transform: translateX(75vw) scale(0.3) rotate(540deg); } }
@keyframes recap-target { 0%, 40%, 100% { opacity: 0.15; transform: scale(1); } 55% { opacity: 0.5; transform: scale(1.2); } }
@keyframes recap-strike-card { from { opacity: 0; transform: translateZ(0) scale(1.3); filter: blur(6px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
@keyframes recap-podium { from { opacity: 0; clip-path: inset(100% 0 0); transform: translateY(50px); } to { opacity: 1; clip-path: inset(0); transform: translateY(0); } }
@keyframes recap-crown { 50% { transform: translateY(-12px) rotate(18deg); text-shadow: 0 8px 26px #f7bf42aa; } }
@keyframes recap-award-flip { from { opacity: 0; transform: perspective(800px) rotateY(-100deg); } to { opacity: 1; transform: perspective(800px) rotateY(0); } }
@keyframes recap-level-up { 50% { transform: translateY(-35px) rotate(-12deg); } }
@keyframes recap-record-rise { from { opacity: 0; transform: translateY(45px); } to { opacity: 1; transform: translateY(0); } }
@keyframes recap-growth { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes recap-celebrate { from { transform: translateY(-90px) rotate(0); } to { transform: translateY(140px) rotate(540deg); } }
@keyframes recap-finale { from { opacity: 0; transform: scale(0.5); letter-spacing: 0.06em; } to { opacity: 1; transform: scale(1); letter-spacing: -0.04em; } }
@keyframes recap-reveal { from { opacity: 0; transform: translateY(70px) scale(0.88) rotate(-3deg); filter: blur(8px); } to { opacity: 1; transform: translateY(0) scale(1) rotate(0); filter: blur(0); } }
@keyframes recap-card-in { from { opacity: 0; transform: perspective(800px) rotateX(30deg) rotateZ(-5deg) translateY(80px) scale(0.8); } to { opacity: 1; transform: perspective(800px) rotateX(0) rotateZ(0) translateY(0) scale(1); } }
@keyframes recap-number-in { from { opacity: 0; transform: scale(0.35) rotate(-12deg); } 65% { opacity: 1; transform: scale(1.08) rotate(3deg); } to { transform: scale(1) rotate(0); } }
@keyframes recap-spin { to { transform: rotate(360deg); } }
@keyframes recap-marquee { to { transform: translateX(-24%) rotate(-12deg); } }
@keyframes recap-disc { 50% { transform: translateY(-50px) scale(1.18); } }
@keyframes recap-beat { from { transform: scaleY(0.2); } to { transform: scaleY(1); } }
@keyframes recap-confetti { 50% { transform: translate(24px, -45px) rotate(120deg); opacity: 0.35; } }
@keyframes recap-orbit { to { rotate: 15deg; scale: 1.08; } }
@keyframes recap-bounce { 50% { translate: 0 10px; } }
@keyframes recap-glow { 50% { transform: scale(1.1) rotate(12deg); } }
@media (max-width: 700px) {
    .bmc-recap__shape { opacity: 0.22; }
    .bmc-recap__ghost { font-size: 120px; -webkit-text-stroke-width: 1px; }
    .bmc-recap__equalizer { width: 80%; gap: 7px; }
    .bmc-recap__viewport { padding: 28px 24px 100px; }
    .bmc-recap__cards, .bmc-recap__records { grid-template-columns: 1fr; gap: 16px; }
    .bmc-recap__card { padding: 24px; }
    .bmc-recap__stats { gap: 12px; }
    .bmc-recap__stats strong { font-size: clamp(40px, 12vw, 70px); }
    .bmc-recap__stats span { font-size: 18px; }
    .bmc-recap__navigation { display: none; }
}
@media (prefers-reduced-motion: reduce) {
    .bmc-recap *, .bmc-recap *::after, .bmc-recap *::before { animation: none !important; transition: none !important; }
}
</style>
