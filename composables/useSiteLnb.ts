export type SiteLnbItem = {
    label: string;
    to: string;
};

export type SiteLnbMenu = {
    matcher: RegExp;
    items: SiteLnbItem[];
};

export const siteLnbMenus: SiteLnbMenu[] = [
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

export function normalizeRoutePath(path: string) {
    const withoutBase = path.replace(/^\/singil-bmc(?=\/|$)/, '') || '/';
    return withoutBase.replace(/\/+$/, '') || '/';
}

/**
 * 형제 LNB 탭 중 현재 라우트와 가장 잘 맞는 항목 하나만 활성화
 * (예: /records/groups 에서 /records 와 /records/groups 가 동시에 active 되지 않음)
 */
export function resolveLnbActivePath(items: SiteLnbItem[], currentPath: string) {
    const path = normalizeRoutePath(currentPath);
    const normalizedItems = items.map((item) => ({
        ...item,
        to: normalizeRoutePath(item.to),
    }));

    const exact = normalizedItems.find((item) => item.to === path);
    if (exact) return exact.to;

    let best: (typeof normalizedItems)[number] | null = null;

    for (const item of normalizedItems) {
        if (item.to === '/') continue;

        if (path === item.to || path.startsWith(`${item.to}/`)) {
            if (!best || item.to.length > best.to.length) {
                best = item;
            }
        }
    }

    return best?.to ?? null;
}

export function useSiteLnb() {
    const route = useRoute();

    const activeMenu = computed(() =>
        siteLnbMenus.find((menu) => menu.matcher.test(normalizeRoutePath(route.path))),
    );

    const activePath = computed(() => {
        if (!activeMenu.value) return null;
        return resolveLnbActivePath(activeMenu.value.items, route.path);
    });

    function isActive(to: string) {
        if (!activePath.value) return false;
        return activePath.value === normalizeRoutePath(to);
    }

    return {
        activeMenu,
        activePath,
        isActive,
    };
}
