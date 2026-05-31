export type MvpBoardEntry = {
    id: string;
    key: string;
    group: string;
    rank: number;
    type: 'batting' | 'pitching' | string;
    name: string;
    summary: string;
    stats?: Record<string, string | number>;
};

export type MvpPeriodBlock = {
    key: string;
    label: string;
    groups: {
        group: string;
        batting: MvpBoardEntry[];
        pitching: MvpBoardEntry[];
    }[];
};

export function formatMvpPeriodKey(key: string, mode: 'monthly' | 'weekly') {
    if (mode === 'monthly') {
        const [year, month] = key.split('-');
        if (year && month) return `${year}년 ${Number(month)}월`;
    }

    const match = key.match(/^(\d{4})-(\d{2})-W(\d+)$/);
    if (match) {
        return `${match[1]}년 ${Number(match[2])}월 ${match[3]}주차`;
    }

    return key;
}

export function compareMvpPeriodKeys(a: string, b: string) {
    return b.localeCompare(a, undefined, { numeric: true });
}

export function buildMvpPeriodBlocks(
    items: MvpBoardEntry[],
    mode: 'monthly' | 'weekly',
    groupFilter: 'all' | 'A' | 'D',
): MvpPeriodBlock[] {
    const keys = [...new Set(items.map((item) => item.key))].sort(compareMvpPeriodKeys);
    const groups = groupFilter === 'all' ? ['A', 'D'] : [groupFilter];

    return keys.map((periodKey) => ({
        key: periodKey,
        label: formatMvpPeriodKey(periodKey, mode),
        groups: groups.map((group) => {
            const inPeriod = items.filter((item) => item.key === periodKey && item.group === group);

            return {
                group,
                batting: inPeriod
                    .filter((item) => item.type === 'batting')
                    .sort((a, b) => a.rank - b.rank),
                pitching: inPeriod
                    .filter((item) => item.type === 'pitching')
                    .sort((a, b) => a.rank - b.rank),
            };
        }),
    }));
}

export function formatMvpStatsLine(entry: MvpBoardEntry) {
    const stats = entry.stats;
    if (!stats) return entry.summary;

    if (entry.type === 'pitching') {
        const parts = [
            stats.ip != null ? `${stats.ip}이닝` : null,
            stats.era != null ? `ERA ${stats.era}` : null,
            stats.so != null ? `K ${stats.so}` : null,
            stats.win != null ? `승 ${stats.win}` : null,
        ].filter(Boolean);
        return parts.length ? parts.join(' · ') : entry.summary;
    }

    const parts = [
        stats.avg != null ? `AVG ${stats.avg}` : null,
        stats.h != null ? `${stats.h}안타` : null,
        stats.rbi != null ? `${stats.rbi}타점` : null,
        stats.hr != null && Number(stats.hr) > 0 ? `HR ${stats.hr}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : entry.summary;
}

export function mvpRankLabel(rank: number) {
    if (rank === 1) return '1위';
    if (rank === 2) return '2위';
    if (rank === 3) return '3위';
    return `${rank}위`;
}
