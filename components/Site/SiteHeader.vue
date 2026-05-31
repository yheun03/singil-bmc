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

            <button class="bmc-header__toggle" type="button" :aria-expanded="menuOpen" :aria-controls="navPanelId"
                :aria-label="menuOpen ? '메뉴 닫기' : '메뉴 열기'" @click="toggleMenu">
                <Icon :icon="menuOpen ? 'mdi:close' : 'mdi:menu'" aria-hidden="true" />
            </button>

            <nav :id="navPanelId" class="bmc-header__nav" :class="{ 'is-open': menuOpen }" aria-label="주요 메뉴">
                <template v-for="(item, index) in siteHeaderNav" :key="index">
                    <NuxtLink
                        v-if="item.type === 'link'"
                        class="bmc-header__link"
                        :class="{ 'is-current': isCurrentPath(item.to) }"
                        :to="item.to"
                        @click="menuOpen = false"
                    >
                        {{ item.label }}
                    </NuxtLink>

                    <div v-else class="bmc-header__dropdown" :class="{
                        'is-open': isGroupOpen(item.label),
                        'is-current': isGroupActive(item),
                    }">
                        <button class="bmc-header__trigger" type="button"
                            :aria-expanded="isGroupOpen(item.label)"
                            :aria-controls="submenuId(item.label)"
                            @click="toggleGroup(item.label)">
                            <span>{{ item.label }}</span>
                            <Icon class="bmc-header__trigger-icon" icon="mdi:chevron-down" aria-hidden="true" />
                        </button>
                        <div :id="submenuId(item.label)" class="bmc-header__submenu">
                            <NuxtLink
                                v-for="child in item.children"
                                :key="child.to"
                                class="bmc-header__sublink"
                                :class="{ 'is-current': isCurrentPath(child.to) }"
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
const openGroup = ref('');
const route = useRoute();
const navPanelId = 'bmc-header-nav';

const activeGroup = computed(() => {
    const group = siteHeaderNav.find((item) => item.type === 'group' && isGroupActive(item));
    return group?.type === 'group' ? group.label : '';
});

function isCurrentPath(to: string) {
    return route.path === to || (to !== '/' && route.path.startsWith(`${to}/`));
}

function isGroupActive(item: (typeof siteHeaderNav)[number]) {
    return item.type === 'group' && item.children.some((child) => isCurrentPath(child.to));
}

function submenuId(label: string) {
    return `bmc-header-submenu-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function isGroupOpen(label: string) {
    return openGroup.value === label;
}

function toggleGroup(label: string) {
    openGroup.value = openGroup.value === label ? '' : label;
}

function toggleMenu() {
    menuOpen.value = !menuOpen.value;

    if (menuOpen.value) {
        openGroup.value = activeGroup.value;
    }
}

watch(
    () => route.fullPath,
    () => {
        menuOpen.value = false;
        openGroup.value = activeGroup.value;
    },
    { immediate: true },
);
</script>
