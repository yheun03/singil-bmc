<template>
    <header class="bmc-header">
        <div class="bmc-header__inner">
            <NuxtLink class="bmc-header__brand" to="/">
                <span class="bmc-header__emblem" aria-hidden="true">
                    <img class="bmc-header__emblem-img" :src="teamLogoUrl" alt="" width="44" height="44" />
                </span>
                <span class="bmc-header__name">
                    <strong>SINGIL BMC</strong>
                    <span>Singil Baseball Mission</span>
                </span>
            </NuxtLink>

            <button class="bmc-header__toggle" type="button" :aria-expanded="menuOpen" aria-label="메뉴"
                @click="menuOpen = !menuOpen">
                {{ menuOpen ? '✕' : '☰' }}
            </button>

            <nav class="bmc-header__nav" :class="{ 'is-open': menuOpen }" aria-label="주요 메뉴">
                <template v-for="(item, index) in siteHeaderNav" :key="index">
                    <NuxtLink
                        v-if="item.type === 'link'"
                        class="bmc-header__link"
                        :to="item.to"
                        @click="menuOpen = false"
                    >
                        {{ item.label }}
                    </NuxtLink>

                    <div v-else class="bmc-header__dropdown">
                        <span class="bmc-header__trigger">{{ item.label }}</span>
                        <div class="bmc-header__submenu">
                            <NuxtLink
                                v-for="child in item.children"
                                :key="child.to"
                                class="bmc-header__sublink"
                                :to="child.to"
                                @click="menuOpen = false"
                            >
                                {{ child.label }}
                            </NuxtLink>
                        </div>
                    </div>
                </template>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">
import { siteHeaderNav } from '~/composables/useSiteNav';

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
