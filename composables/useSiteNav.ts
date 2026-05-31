export type SiteNavLink = {
    label: string;
    to: string;
};

export type SiteNavItem = { type: 'link'; label: string; to: string } | { type: 'group'; label: string; children: SiteNavLink[] };

/** GNB 1뎁스: HOME · TEAM · GAMES · STATS · MEDIA */
export const siteHeaderNav: SiteNavItem[] = [
    { type: 'link', label: 'HOME', to: '/' },
    {
        type: 'group',
        label: 'TEAM',
        children: [
            { label: '소개', to: '/about' },
            { label: '조직/섬김이', to: '/about/leaders' },
            { label: '히스토리', to: '/about/history' },
            { label: '선수 명단', to: '/players' },
        ],
    },
    { type: 'link', label: 'GAMES', to: '/games' },
    {
        type: 'group',
        label: 'STATS',
        children: [
            { label: '전체 기록', to: '/records' },
            { label: '연도별', to: '/records/yearly' },
            { label: '월별', to: '/records/monthly' },
            // { label: '조별', to: '/records/groups' },
            { label: 'MVP', to: '/mvp' },
        ],
    },
    {
        type: 'group',
        label: 'MEDIA',
        children: [
            { label: 'David TV', to: '/videos' },
            { label: '갤러리', to: '/gallery/team' },
            { label: '구단소식', to: '/news' },
        ],
    },
];
