<template>
    <header ref="headerRef" class="bmc-header">
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

            <button
                class="bmc-header__theme"
                type="button"
                role="switch"
                :aria-checked="isDark"
                :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
                :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
                @click="preferences.toggleTheme()"
            >
                <span class="bmc-header__theme-track">
                    <Icon class="bmc-header__theme-ico bmc-header__theme-ico--sun" icon="mdi:white-balance-sunny" aria-hidden="true" />
                    <Icon class="bmc-header__theme-ico bmc-header__theme-ico--moon" icon="mdi:weather-night" aria-hidden="true" />
                    <span class="bmc-header__theme-knob" aria-hidden="true" />
                </span>
            </button>

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
                            @click="onTriggerClick(item)">
                            <span>{{ item.label }}</span>
                            <Icon class="bmc-header__trigger-icon" icon="mdi:chevron-down" aria-hidden="true" />
                        </button>
                        <div :id="submenuId(item.label)" class="bmc-header__submenu">
                            <NuxtLink
                                v-for="child in item.children"
                                :key="child.to"
                                class="bmc-header__sublink"
                                :class="{ 'is-current': isChildActive(item.children, child.to) }"
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
import { normalizeRoutePath, resolveLnbActivePath } from '~/composables/useSiteLnb';
import { usePreferencesStore } from '~/stores/preferences';

const preferences = usePreferencesStore();
// SSR(기본 dark)과 클라이언트(localStorage) 테마가 달라 하이드레이션 미스매치가
// 나면 Vue가 속성을 갱신하지 않아 토글이 고정된다. 마운트 후에 실제 테마를
// 반영해 정상적인 반응형 패치로 처리한다.
const mounted = ref(false);
onMounted(() => {
    mounted.value = true;
});
const isDark = computed(() => mounted.value && preferences.theme === 'dark');

const { getAssetPath } = useBasePath();
const teamLogoUrl = computed(() => getAssetPath('icons/logo.png'));
const menuOpen = ref(false);
const openGroup = ref('');
const route = useRoute();
const router = useRouter();
const navPanelId = 'bmc-header-nav';
const headerRef = ref<HTMLElement | null>(null);

useSiteHeaderHeight(headerRef);

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

/** 형제 서브링크 중 현재 경로와 가장 잘 맞는 1개만 활성화(접두 경로 중복 방지) */
function isChildActive(children: { label: string; to: string }[], to: string) {
    return resolveLnbActivePath(children, route.path) === normalizeRoutePath(to);
}

/** 트리거 클릭 시 데스크톱은 2뎁스 첫 항목으로 이동, 모바일은 아코디언 토글 */
function onTriggerClick(item: (typeof siteHeaderNav)[number]) {
    if (item.type !== 'group') return;

    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 981px)').matches;

    if (isDesktop) {
        const first = item.children[0];
        if (first) {
            menuOpen.value = false;
            router.push(first.to);
        }
        return;
    }

    toggleGroup(item.label);
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
