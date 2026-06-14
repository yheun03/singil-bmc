<template>
    <div>
        <SitePageHero
            eyebrow="BRAND"
            title="브랜드 스토리"
            description="신길교회 다윗 야구 선교단의 이름과 엠블럼, 그리고 우리가 그라운드에서 추구하는 가치를 소개합니다."
        />
        <SiteLnb />

        <!-- 엠블럼 쇼케이스 -->
        <section class="bmc-section bmc-section--white bmc-brand-hero">
            <div class="bmc-section__inner bmc-brand-hero__inner">
                <div class="bmc-brand-hero__emblem">
                    <span class="bmc-brand-hero__glow" aria-hidden="true"></span>
                    <img :src="teamLogoUrl" alt="다윗 야구 선교단 엠블럼" width="240" height="240" />
                </div>
                <div class="bmc-brand-hero__text">
                    <p class="bmc-section__eyebrow">EMBLEM · SINCE 2017</p>
                    <h2 class="bmc-brand-hero__title">다윗 야구 선교단<br><span>DAVID BASEBALL MISSION</span></h2>
                    <p class="bmc-brand-hero__desc">
                        2017년, 신길교회 성도들이 야구 하나로 모였습니다.
                        방패 모양의 엠블럼은 믿음의 공동체를 지키고 함께 싸우는 한 팀(One Team)을 상징하며,
                        가운데 새겨진 <strong>‘다윗’</strong>은 우리가 닮고자 하는 정신을 담고 있습니다.
                    </p>
                    <div class="bmc-brand-hero__chips">
                        <span class="bmc-brand-chip">창단 2017</span>
                        <span class="bmc-brand-chip">A · D조 운영</span>
                        <span class="bmc-brand-chip">신길교회</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 이름의 의미: 왜 다윗인가 -->
        <section class="bmc-section">
            <div class="bmc-section__inner">
                <div class="bmc-section__head">
                    <div>
                        <p class="bmc-section__eyebrow">THE NAME</p>
                        <h2 class="bmc-section__title">왜 ‘다윗’인가</h2>
                    </div>
                </div>
                <p class="bmc-brand-lead">
                    소년 다윗은 거인 골리앗 앞에서도 물러서지 않았습니다.
                    실력이나 체격이 아니라 <strong>믿음과 용기</strong>로 섰던 그 모습은,
                    아마추어 그라운드에 서는 우리의 마음가짐과 같습니다.
                    승패를 넘어 정직하게 땀 흘리고, 서로를 세우며, 끝까지 함께 뛰는 팀.
                </p>
                <div class="bmc-grid bmc-grid--3">
                    <article class="bmc-brand-value">
                        <span class="bmc-brand-value__icon">✝</span>
                        <h3>믿음 <small>FAITH</small></h3>
                        <p>결과보다 과정에서 복음의 가치를 나눕니다. 그라운드는 또 하나의 예배입니다.</p>
                    </article>
                    <article class="bmc-brand-value">
                        <span class="bmc-brand-value__icon">⚡</span>
                        <h3>용기 <small>COURAGE</small></h3>
                        <p>강한 상대 앞에서도 주눅 들지 않습니다. 다윗처럼 담대하게 한 구, 한 타석에 집중합니다.</p>
                    </article>
                    <article class="bmc-brand-value">
                        <span class="bmc-brand-value__icon">🤝</span>
                        <h3>공동체 <small>FELLOWSHIP</small></h3>
                        <p>혼자가 아니라 함께입니다. 선수·가족·교회가 한 팀으로 응원하고 축하합니다.</p>
                    </article>
                </div>
            </div>
        </section>

        <!-- 엠블럼 해부 -->
        <section class="bmc-section bmc-section--white">
            <div class="bmc-section__inner">
                <div class="bmc-section__head">
                    <div>
                        <p class="bmc-section__eyebrow">SYMBOLS</p>
                        <h2 class="bmc-section__title">엠블럼에 담긴 의미</h2>
                    </div>
                </div>
                <div class="bmc-grid bmc-grid--2">
                    <article v-for="symbol in symbols" :key="symbol.title" class="bmc-brand-symbol">
                        <span class="bmc-brand-symbol__mark">{{ symbol.mark }}</span>
                        <div>
                            <h3 class="bmc-brand-symbol__title">{{ symbol.title }}</h3>
                            <p class="bmc-brand-symbol__desc">{{ symbol.desc }}</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <!-- 팀 컬러 -->
        <section class="bmc-section">
            <div class="bmc-section__inner">
                <div class="bmc-section__head">
                    <div>
                        <p class="bmc-section__eyebrow">COLORS</p>
                        <h2 class="bmc-section__title">팀 컬러</h2>
                    </div>
                </div>
                <div class="bmc-brand-palette">
                    <article v-for="color in palette" :key="color.hex" class="bmc-brand-swatch">
                        <div class="bmc-brand-swatch__chip" :style="{ background: color.hex }">
                            <span v-if="color.ring" class="bmc-brand-swatch__ring"></span>
                        </div>
                        <strong>{{ color.name }}</strong>
                        <code>{{ color.hex }}</code>
                        <span>{{ color.meaning }}</span>
                    </article>
                </div>
            </div>
        </section>

        <!-- 타이포그래피 -->
        <section class="bmc-section bmc-section--white">
            <div class="bmc-section__inner">
                <div class="bmc-section__head">
                    <div>
                        <p class="bmc-section__eyebrow">TYPOGRAPHY</p>
                        <h2 class="bmc-section__title">타이포그래피</h2>
                    </div>
                </div>
                <div class="bmc-grid bmc-grid--3">
                    <article class="bmc-brand-type">
                        <span class="bmc-brand-type__sample bmc-brand-type__sample--anton">DAVID</span>
                        <strong>Anton</strong>
                        <span>임팩트 있는 영문 디스플레이 — 히어로·섹션 타이틀</span>
                    </article>
                    <article class="bmc-brand-type">
                        <span class="bmc-brand-type__sample bmc-brand-type__sample--archivo">2017</span>
                        <strong>Archivo Black</strong>
                        <span>점수·등번호·날짜 등 강조 숫자</span>
                    </article>
                    <article class="bmc-brand-type">
                        <span class="bmc-brand-type__sample bmc-brand-type__sample--pretendard">다윗 야구 선교단</span>
                        <strong>Pretendard</strong>
                        <span>가독성 높은 한글 본문</span>
                    </article>
                </div>
            </div>
        </section>

        <!-- 슬로건 -->
        <section class="bmc-section bmc-brand-slogan">
            <div class="bmc-section__inner bmc-brand-slogan__inner">
                <p class="bmc-brand-slogan__eyebrow">OUR SLOGAN</p>
                <h2 class="bmc-brand-slogan__title">
                    <span>ONE TEAM,</span>
                    <span class="bmc-brand-slogan__accent">ONE FAITH</span>
                </h2>
                <p class="bmc-brand-slogan__desc">
                    한 팀으로 뛰고, 한 믿음으로 모입니다. 우리는 다윗처럼 담대하게, 함께 그라운드를 누빕니다.
                </p>
                <NuxtLink class="bmc-btn bmc-btn--gold" to="/about">선교단 더 알아보기</NuxtLink>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ title: '브랜드 스토리' });

const { getAssetPath } = useBasePath();
const teamLogoUrl = computed(() => getAssetPath('icons/logo.png'));

const symbols = [
    {
        mark: '🛡️',
        title: '방패 (Shield)',
        desc: '믿음의 공동체를 지키고 함께 싸우는 한 팀. 어떤 상대 앞에서도 서로를 등진다는 약속입니다.',
    },
    {
        mark: '⚾',
        title: '야구공 & 배트',
        desc: '우리를 하나로 모은 야구. 정정당당한 승부와 즐거운 경기, 그 자체가 교제의 도구입니다.',
    },
    {
        mark: '✦',
        title: '‘다윗’ 레터마크',
        desc: '엠블럼 중앙의 붉은 ‘다윗’. 믿음과 용기로 골리앗 앞에 선 그 정신이 팀의 중심입니다.',
    },
    {
        mark: '2017',
        title: '창단 연도',
        desc: '2017년, 신길교회 성도들이 야구로 모인 첫 해. 매 시즌 이 숫자 위에 새로운 기록을 쌓아갑니다.',
    },
];

const palette = [
    { name: 'Ink Navy', hex: '#0a1124', meaning: '믿음과 신뢰의 바탕', ring: false },
    { name: 'Royal Blue', hex: '#1e56c8', meaning: '신길교회의 정체성', ring: false },
    { name: 'David Red', hex: '#e11d2a', meaning: '다윗의 열정과 용기', ring: false },
    { name: 'Champion Gold', hex: '#dbb94a', meaning: '승리와 영광', ring: false },
    { name: 'Pure White', hex: '#ffffff', meaning: '순결과 정직', ring: true },
];
</script>

<style scoped lang="scss">
@use 'site/tokens' as *;

// 엠블럼 쇼케이스 — 흰색 텍스트 기반이라 라이트에서도 다크 밴드로 고정
.bmc-brand-hero {
    background: linear-gradient(135deg, $bmc-ink-800 0%, $bmc-ink-900 100%);
}

.bmc-brand-hero__inner {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 48px;
    align-items: center;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
        gap: 28px;
        text-align: center;
        justify-items: center;
    }
}

.bmc-brand-hero__emblem {
    position: relative;
    display: grid;
    place-items: center;
    width: 240px;
    height: 240px;

    img {
        position: relative;
        z-index: 1;
        width: 200px;
        height: 200px;
        object-fit: contain;
        filter: drop-shadow(0 18px 40px rgba(#000, 0.5));
        animation: bmc-brand-float 5s ease-in-out infinite;
    }
}

.bmc-brand-hero__glow {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($bmc-red-500, 0.35), transparent 62%);
    filter: blur(12px);
    animation: bmc-brand-pulse 4s ease-in-out infinite;
}

@keyframes bmc-brand-float {
    50% {
        transform: translateY(-10px);
    }
}

@keyframes bmc-brand-pulse {
    0%, 100% {
        transform: scale(0.9);
        opacity: 0.6;
    }
    50% {
        transform: scale(1.08);
        opacity: 1;
    }
}

.bmc-brand-hero__title {
    margin: 8px 0 16px;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: #fff;

    span {
        display: block;
        margin-top: 6px;
        font-family: $bmc-font-display;
        font-weight: 400;
        font-size: 0.6em;
        letter-spacing: 0.04em;
        color: $bmc-gold-400;
    }
}

.bmc-brand-hero__desc {
    margin: 0 0 20px;
    max-width: 600px;
    line-height: 1.8;
    color: rgba(#fff, 0.72);

    strong {
        color: $bmc-red-400;
    }
}

.bmc-brand-hero__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    @media (max-width: 760px) {
        justify-content: center;
    }
}

.bmc-brand-chip {
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid rgba(#fff, 0.16);
    background: rgba(#fff, 0.05);
    font-size: 0.8125rem;
    font-weight: 700;
    color: rgba(#fff, 0.85);
}

// 리드 문단
.bmc-brand-lead {
    margin: 0 0 28px;
    max-width: 820px;
    font-size: clamp(1.0625rem, 1.6vw, 1.25rem);
    line-height: 1.8;
    color: rgba(#fff, 0.8);

    strong {
        color: $bmc-gold-400;
    }
}

// 가치 카드
.bmc-brand-value {
    padding: 28px 24px;
    border: 1px solid rgba(#fff, 0.08);
    border-radius: 16px;
    background: linear-gradient(180deg, #131d3a, #0f1730);
    transition: transform 0.18s ease, border-color 0.18s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba($bmc-red-500, 0.5);
    }

    &__icon {
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        margin-bottom: 16px;
        border-radius: 14px;
        background: rgba($bmc-red-500, 0.18);
        font-size: 1.5rem;
    }

    h3 {
        margin: 0 0 10px;
        font-size: 1.25rem;
        font-weight: 900;
        color: #fff;

        small {
            margin-left: 8px;
            font-size: 0.6875rem;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: $bmc-gold-400;
        }
    }

    p {
        margin: 0;
        line-height: 1.7;
        color: rgba(#fff, 0.62);
        font-size: 0.9375rem;
    }
}

// 엠블럼 심볼
.bmc-brand-symbol {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 18px;
    align-items: center;
    padding: 22px 24px;
    border: 1px solid rgba(#fff, 0.08);
    border-radius: 14px;
    background: linear-gradient(180deg, #131d3a, #0f1730);

    &__mark {
        display: grid;
        place-items: center;
        width: 64px;
        height: 64px;
        border-radius: 14px;
        background: rgba(#fff, 0.05);
        border: 1px solid rgba(#fff, 0.08);
        font-family: $bmc-font-display-alt;
        font-size: 1.75rem;
        color: $bmc-gold-400;
    }

    &__title {
        margin: 0 0 6px;
        font-size: 1.0625rem;
        font-weight: 800;
        color: #fff;
    }

    &__desc {
        margin: 0;
        line-height: 1.65;
        font-size: 0.875rem;
        color: rgba(#fff, 0.6);
    }
}

// 팔레트
.bmc-brand-palette {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;

    @media (max-width: 860px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 520px) {
        grid-template-columns: repeat(2, 1fr);
    }
}

.bmc-brand-swatch {
    display: grid;
    gap: 4px;

    &__chip {
        position: relative;
        height: 120px;
        border-radius: 14px;
        margin-bottom: 10px;
        box-shadow: inset 0 0 0 1px rgba(#fff, 0.08), 0 12px 26px rgba(#000, 0.3);
        transition: transform 0.18s ease;
    }

    &:hover &__chip {
        transform: translateY(-4px) scale(1.02);
    }

    &__ring {
        position: absolute;
        inset: 0;
        border-radius: 14px;
        box-shadow: inset 0 0 0 1px rgba(#000, 0.12);
    }

    strong {
        font-size: 0.9375rem;
        font-weight: 800;
        color: #fff;
    }

    code {
        font-family: $bmc-font-display-alt;
        font-size: 0.8125rem;
        letter-spacing: 0.04em;
        color: $bmc-gold-400;
    }

    span {
        font-size: 0.8125rem;
        color: rgba(#fff, 0.55);
    }
}

// 타이포그래피
.bmc-brand-type {
    padding: 24px;
    border: 1px solid rgba(#fff, 0.08);
    border-radius: 14px;
    background: linear-gradient(180deg, #131d3a, #0f1730);
    text-align: center;

    &__sample {
        display: block;
        margin-bottom: 16px;
        line-height: 1;
        color: #fff;

        &--anton {
            font-family: $bmc-font-display;
            font-size: 3.5rem;
            letter-spacing: 0.02em;
        }

        &--archivo {
            font-family: $bmc-font-display-alt;
            font-size: 3.5rem;
            color: $bmc-gold-400;
        }

        &--pretendard {
            font-size: 1.75rem;
            font-weight: 900;
            padding: 0.8rem 0;
        }
    }

    strong {
        display: block;
        font-size: 1rem;
        font-weight: 800;
        color: #fff;
    }

    span {
        display: block;
        margin-top: 6px;
        font-size: 0.8125rem;
        line-height: 1.5;
        color: rgba(#fff, 0.55);
    }
}

// 슬로건
.bmc-brand-slogan {
    position: relative;
    overflow: hidden;
    background: radial-gradient(120% 120% at 50% 0%, $bmc-ink-700, $bmc-ink-900 70%);
    text-align: center;

    &__inner {
        position: relative;
        z-index: 1;
    }

    &__eyebrow {
        margin: 0 0 14px;
        font-family: $bmc-font-display-alt;
        font-size: 0.8125rem;
        letter-spacing: 0.16em;
        color: $bmc-gold-400;
    }

    &__title {
        margin: 0 0 18px;
        font-family: $bmc-font-display;
        font-weight: 400;
        font-size: clamp(2.5rem, 8vw, 5rem);
        line-height: 0.95;
        text-transform: uppercase;
        color: #fff;

        span {
            display: block;
        }

        .bmc-brand-slogan__accent {
            color: transparent;
            -webkit-text-stroke: 2px $bmc-white;
        }
    }

    &__desc {
        margin: 0 auto 28px;
        max-width: 560px;
        line-height: 1.8;
        color: rgba(#fff, 0.72);
    }
}

// ─── 라이트 테마: 자체 배경이 없는 흰색 텍스트(리드/스와치 라벨) 보정 ───
// (값·심볼·타이포 카드와 슬로건은 자체 다크 배경이라 그대로 둔다)
:root[data-theme='light'] {
    .bmc-brand-lead {
        color: rgba($bmc-navy-900, 0.82);

        strong {
            color: $bmc-red-500;
        }
    }

    .bmc-brand-swatch {
        strong {
            color: $bmc-navy-900;
        }

        code {
            color: $bmc-red-500;
        }

        span {
            color: $bmc-gray-500;
        }
    }
}
</style>
