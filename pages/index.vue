<template>
    <div class="home">
        <header class="home__hero" aria-label="메인 소개 영역">
            <div class="home__hero-top">
                <div class="home__brand">
                    <span class="home__brand-icon" aria-hidden="true">
                        <Icon icon="mdi:application-braces-outline" />
                    </span>
                    <span class="home__brand-name">Framework</span>
                </div>
                <NuxtLink class="home__signin" to="/auth/sign-in">Sign in</NuxtLink>
            </div>
            <div class="home__hero-content">
                <p class="home__eyebrow">Workspace + Components</p>
                <h1 class="home__title">팀이 바로 시작할 수 있는<br>Vue/Nuxt 프레임워크</h1>
                <p class="home__desc">
                    인증/에러 페이지와 동일한 톤으로 구성한 메인 화면입니다.
                    워크스페이스, 컴포넌트 데모, 가이드 페이지로 빠르게 이동할 수 있습니다.
                </p>
                <div class="home__hero-actions">
                    <AppButton to="/workspace" size="lg" variant="fill">워크스페이스 시작</AppButton>
                    <AppButton to="/demos/demo-button" size="lg" variant="outline">UI 데모 보기</AppButton>
                </div>
            </div>
        </header>

        <main class="home__main" aria-label="메인 콘텐츠">
            <section class="home__grid" aria-label="주요 이동">
                <NuxtLink class="home__card" to="/workspace">
                    <span class="home__card-icon" aria-hidden="true">
                        <Icon icon="mdi:view-dashboard-outline" />
                    </span>
                    <strong class="home__card-title">Workspace</strong>
                    <p class="home__card-desc">프로젝트 탭, 작업 흐름, 생산성 도구를 한 화면에서 관리합니다.</p>
                </NuxtLink>

                <NuxtLink class="home__card" to="/demos/demo-button">
                    <span class="home__card-icon" aria-hidden="true">
                        <Icon icon="mdi:widgets-outline" />
                    </span>
                    <strong class="home__card-title">UI Demos</strong>
                    <p class="home__card-desc">AppInput, AppChoice 등 공통 UI를 예제로 빠르게 검증합니다.</p>
                </NuxtLink>

                <NuxtLink class="home__card" to="/auth/sign-up">
                    <span class="home__card-icon" aria-hidden="true">
                        <Icon icon="mdi:account-plus-outline" />
                    </span>
                    <strong class="home__card-title">Get Started</strong>
                    <p class="home__card-desc">새 계정으로 가입하고 팀 워크스페이스를 바로 생성할 수 있습니다.</p>
                </NuxtLink>
            </section>

            <footer class="home__footer">
                <p>© {{ currentYear }} Framework. All rights reserved.</p>
            </footer>
        </main>
    </div>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped lang="scss">
.home {
    min-height: 100vh;
    background:
        radial-gradient(900px 520px at 8% 5%, rgba($primary-500, 0.25), transparent 52%),
        radial-gradient(840px 560px at 95% 2%, rgba($primary-200, 0.30), transparent 52%),
        linear-gradient(180deg, $gray-0, $primary-50);
    color: $gray-900;
    padding: 22px 22px 28px;
}

.home__hero {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    padding: 24px;
    margin-bottom: 16px;
    background:
        radial-gradient(900px 540px at 20% 10%, rgba($primary-500, .55), transparent 60%),
        radial-gradient(820px 560px at 90% 20%, rgba($primary-200, .58), transparent 60%),
        radial-gradient(860px 640px at 40% 105%, rgba($status-info, .25), transparent 62%),
        linear-gradient(180deg, $primary-900, $primary-700);
    border: 1px solid rgba($gray-0, 0.18);
    box-shadow:
        0 24px 58px rgba($primary-900, 0.14),
        0 10px 22px rgba($primary-900, 0.12);
    color: $gray-0;

    &::before {
        content: "";
        position: absolute;
        inset: -1px;
        background:
            linear-gradient(135deg, rgba($gray-0, .14), rgba($gray-0, 0) 35%),
            repeating-linear-gradient(135deg,
                rgba($gray-0, .08) 0px,
                rgba($gray-0, .08) 1px,
                rgba($gray-0, 0) 1px,
                rgba($gray-0, 0) 10px);
        opacity: .45;
        pointer-events: none;
    }
}

.home__hero-top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 24px;
}

.home__brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.home__brand-icon {
    width: 28px;
    height: 28px;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    background: rgba($gray-0, 0.16);
    border: 1px solid rgba($gray-0, 0.28);
}

.home__brand-name {
    @include font(btn2, sb);
}

.home__signin {
    @include font(btn3, sb);
    color: rgba($gray-0, 0.92);
    text-decoration: none;
    border: 1px solid rgba($gray-0, 0.28);
    border-radius: 999px;
    height: 36px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba($gray-0, 0.08);
}

.home__hero-content {
    position: relative;
    max-width: 760px;
    display: grid;
    gap: 12px;
}

.home__eyebrow {
    margin: 0;
    @include font(c1, sb);
    color: rgba($gray-0, 0.82);
    text-transform: uppercase;
    letter-spacing: .06em;
}

.home__title {
    margin: 0;
    @include font(t4, sb);
    line-height: 1.25;
}

.home__desc {
    margin: 0;
    @include font(b3, rg);
    color: rgba($gray-0, .82);
    line-height: 1.55;
    max-width: 680px;
}

.home__hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 4px;
}

.home__main {
    max-width: 1180px;
    width: 100%;
    margin: 0 auto;
}

.home__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}

.home__card {
    display: grid;
    gap: 8px;
    padding: 18px;
    border-radius: 16px;
    border: 1px solid rgba($gray-900, .10);
    background: rgba($gray-0, .86);
    text-decoration: none;
    box-shadow:
        0 18px 44px rgba($primary-900, .08),
        0 8px 18px rgba($primary-900, .06);
    transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;

    &:hover {
        transform: translateY(-2px);
        border-color: rgba($primary-500, .30);
        box-shadow:
            0 24px 54px rgba($primary-900, .10),
            0 10px 20px rgba($primary-900, .08);
    }
}

.home__card-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: inline-grid;
    place-items: center;
    color: $primary-700;
    background: rgba($primary-100, .9);
}

.home__card-title {
    @include font(btn2, sb);
    color: $gray-900;
}

.home__card-desc {
    margin: 0;
    @include font(c1, rg);
    color: rgba($gray-900, .62);
    line-height: 1.55;
}

.home__footer {
    margin-top: 14px;
    text-align: center;

    p {
        margin: 0;
        @include font(c2, rg);
        color: rgba($gray-900, .54);
    }
}

@media (max-width: 980px) {
    .home {
        padding: 14px 14px 20px;
    }

    .home__hero {
        border-radius: 18px;
        padding: 16px;
    }

    .home__title {
        @include font(t5, sb);
    }

    .home__grid {
        grid-template-columns: 1fr;
    }
}
</style>