<template>
    <header class="bmc-header">
        <div class="bmc-header__inner">
            <NuxtLink class="bmc-header__brand" to="/">
                <span class="bmc-header__emblem" aria-hidden="true">
                    <img class="bmc-header__emblem-img" :src="teamLogoUrl" alt="" width="44" height="44" />
                </span>
                <span class="bmc-header__name">
                    <strong>신길교회 야구 선교단</strong>
                    <span>Singil Baseball Mission</span>
                </span>
            </NuxtLink>

            <button
                class="bmc-header__toggle"
                type="button"
                :aria-expanded="menuOpen"
                aria-label="메뉴"
                @click="menuOpen = !menuOpen"
            >
                {{ menuOpen ? '✕' : '☰' }}
            </button>

            <nav class="bmc-header__nav" :class="{ 'is-open': menuOpen }" aria-label="주요 메뉴">
                <NuxtLink class="bmc-header__link" to="/" @click="menuOpen = false">홈</NuxtLink>
                <NuxtLink class="bmc-header__link" to="/games" @click="menuOpen = false">경기</NuxtLink>

                <div class="bmc-header__dropdown">
                    <span class="bmc-header__link">선교단 소개</span>
                    <div class="bmc-header__submenu">
                        <NuxtLink class="bmc-header__sublink" to="/about" @click="menuOpen = false">소개</NuxtLink>
                        <NuxtLink class="bmc-header__sublink" to="/about/leaders" @click="menuOpen = false">조직/섬김이</NuxtLink>
                        <NuxtLink class="bmc-header__sublink" to="/about/history" @click="menuOpen = false">히스토리</NuxtLink>
                    </div>
                </div>

                <div class="bmc-header__dropdown">
                    <span class="bmc-header__link">기록</span>
                    <div class="bmc-header__submenu">
                        <NuxtLink class="bmc-header__sublink" to="/records" @click="menuOpen = false">전체 기록</NuxtLink>
                        <NuxtLink class="bmc-header__sublink" to="/records/yearly" @click="menuOpen = false">연도별</NuxtLink>
                        <NuxtLink class="bmc-header__sublink" to="/records/monthly" @click="menuOpen = false">월별</NuxtLink>
                        <NuxtLink class="bmc-header__sublink" to="/records/groups" @click="menuOpen = false">조별</NuxtLink>
                    </div>
                </div>

                <div class="bmc-header__dropdown">
                    <span class="bmc-header__link">MVP</span>
                    <div class="bmc-header__submenu">
                        <NuxtLink class="bmc-header__sublink" to="/mvp/monthly" @click="menuOpen = false">월별 MVP</NuxtLink>
                        <NuxtLink class="bmc-header__sublink" to="/mvp/weekly" @click="menuOpen = false">주간 MVP</NuxtLink>
                    </div>
                </div>

                <NuxtLink class="bmc-header__link" to="/players" @click="menuOpen = false">선수</NuxtLink>
                <NuxtLink class="bmc-header__link" to="/videos" @click="menuOpen = false">영상</NuxtLink>
                <NuxtLink class="bmc-header__link" to="/news" @click="menuOpen = false">소식</NuxtLink>
                <NuxtLink class="bmc-header__link" to="/contact" @click="menuOpen = false">문의</NuxtLink>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">
const { getAssetPath } = useBasePath();
const teamLogoUrl = computed(() => getAssetPath('icons/logo.png'));
const menuOpen = ref(false);
const route = useRoute();

watch(
    () => route.fullPath,
    () => {
        menuOpen.value = false;
    },
);
</script>
