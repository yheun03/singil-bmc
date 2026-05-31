<template>
    <div class="login">
        <section class="login__hero" aria-label="브랜드 이미지 영역">
            <div class="login__hero-inner">
                <div class="login__brand">
                    <div class="login__logo" aria-hidden="true">
                        <Icon icon="mdi:application-braces-outline" />
                    </div>
                    <p class="login__tagline">워크스페이스 + UI 데모를 위한 Framework</p>
                </div>

                <p class="login__copyright">
                    © {{ new Date().getFullYear() }} Framework. All rights reserved.
                </p>
            </div>
        </section>

        <main class="login__panel" aria-label="로그인 폼">
            <div class="login__panel-inner">
                <header class="login__header">
                    <h1 class="login__title">로그인</h1>
                    <p class="login__desc">계정 정보를 입력해 주세요.</p>
                </header>

                <form class="login__form" @submit.prevent="onSubmit">
                    <AppInput v-model="email" name="email" type="email" label="이메일" placeholder="name@company.com" />
                    <AppInput v-model="password" name="password" type="password" label="비밀번호" placeholder="비밀번호 입력" />

                    <div class="login__row">
                        <AppChoice v-model="rememberMe" type="checkbox" label="로그인 상태 유지" />
                        <NuxtLink class="login__link" to="/auth/find-pw">비밀번호를 잊으셨나요?</NuxtLink>
                    </div>

                    <AppButton class="login__submit" type="submit" variant="fill" size="lg" :disabled="!canSubmit">
                        로그인
                    </AppButton>

                    <div class="login__footer">
                        <span class="login__footer-text">계정이 없으신가요?</span>
                        <NuxtLink class="login__link" to="/auth/sign-up">가입하기</NuxtLink>
                    </div>
                </form>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">

definePageMeta({
    layout: false,
})

const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const canSubmit = computed(() => {
    return email.value.trim().length > 0 && password.value.trim().length > 0
})

function onSubmit() {
    // 데모 페이지: 실제 로그인 연동 전까지는 이동만 처리
    navigateTo('/')
}
</script>