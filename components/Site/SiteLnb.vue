<template>
    <nav v-if="activeMenu" class="bmc-lnb" aria-label="하위 메뉴">
        <div class="bmc-lnb__inner">
            <div ref="listRef" class="bmc-lnb__list">
                <NuxtLink v-for="item in activeMenu.items" :key="item.to" class="bmc-lnb__link" :to="item.to"
                    :class="{ 'is-active': isActive(item.to) }" :aria-current="isActive(item.to) ? 'page' : undefined">
                    {{ item.label }}
                </NuxtLink>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
type LnbItem = {
    label: string;
    to: string;
};

type LnbMenu = {
    matcher: RegExp;
    items: LnbItem[];
};

const route = useRoute();
const listRef = ref<HTMLElement | null>(null);

const menus: LnbMenu[] = [
    {
        matcher: /^\/about/,
        items: [
            { label: '선교단 소개', to: '/about' },
            { label: '조직/섬김이', to: '/about/leaders' },
            { label: '히스토리', to: '/about/history' },
        ],
    },
    {
        matcher: /^\/records/,
        items: [
            { label: '전체 기록', to: '/records' },
            { label: '연도별 기록', to: '/records/yearly' },
            { label: '월별 기록', to: '/records/monthly' },
            { label: '조별 기록', to: '/records/groups' },
        ],
    },
    {
        matcher: /^\/mvp/,
        items: [
            { label: '월별 MVP', to: '/mvp/monthly' },
            { label: '주간 MVP', to: '/mvp/weekly' },
        ],
    },
    {
        matcher: /^\/players/,
        items: [
            { label: '전체', to: '/players' },
            { label: '투수', to: '/players/pitchers' },
            { label: '타자', to: '/players/batters' },
        ],
    },
    {
        matcher: /^\/(videos|gallery|news)/,
        items: [
            { label: 'David TV', to: '/videos' },
            { label: '갤러리', to: '/gallery/team' },
            { label: '구단소식', to: '/news' },
        ],
    },
    {
        matcher: /^\/contact/,
        items: [
            { label: '문의하기', to: '/contact' },
        ],
    },
];

const activeMenu = computed(() => menus.find((menu) => menu.matcher.test(route.path)));
const activeIndex = computed(() => activeMenu.value?.items.findIndex((item) => isActive(item.to)) ?? -1);

function isActive(to: string) {
    return route.path === to || (to !== '/' && route.path.startsWith(`${to}/`));
}

function scrollActiveLink(behavior: ScrollBehavior = 'smooth') {
    const list = listRef.value;
    const index = activeIndex.value;

    if (!list || index < 0) {
        return;
    }

    const activeLink = list.children.item(index) as HTMLElement | null;
    activeLink?.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
}

onMounted(() => {
    scrollActiveLink('auto');
});

watch(
    () => route.path,
    async () => {
        await nextTick();
        scrollActiveLink();
    },
);
</script>
