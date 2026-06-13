import {
    mergeBattingRowsByPlayerId,
    mergePitchingRowsByPlayerId,
    type BattingAggregateRow,
    type PeriodRecordSlice,
    type PitchingAggregateRow,
} from '~/utils/record-aggregate';

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

function normalizePlayerName(name: string) {
    return String(name ?? '').replace(/\s+/g, '').trim();
}

function ipToOuts(ip: string | number) {
    const [whole = '0', frac = '0'] = String(ip ?? '0').split('.');
    return Number(whole) * 3 + Number(frac);
}

function pickMvpBattingLeaders(rows: BattingAggregateRow[], periodKey: string): MvpBoardEntry[] {
    return [...rows]
        .map((row) => ({ row, score: calcMvpBattingScore(row) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ row, score }, index) => ({
            id: `${periodKey}-all-batting-${index + 1}`,
            key: periodKey,
            group: 'all',
            rank: index + 1,
            type: 'batting',
            name: row.name,
            summary: `${row.h}안타 ${row.rbi}타점 ${row.r}득점`,
            stats: {
                avg: row.avg,
                h: row.h,
                rbi: row.rbi,
                hr: row.hr,
                score: Number(score.toFixed(1)),
            },
        }));
}

function pickMvpPitchingLeaders(rows: PitchingAggregateRow[], periodKey: string): MvpBoardEntry[] {
    return [...rows]
        .map((row) => ({ row, score: calcMvpPitchingScore(row) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ row, score }, index) => ({
            id: `${periodKey}-all-pitching-${index + 1}`,
            key: periodKey,
            group: 'all',
            rank: index + 1,
            type: 'pitching',
            name: row.name,
            summary: `${row.ip}이닝 ${row.so}탈삼진`,
            stats: {
                ip: row.ip,
                era: row.era,
                so: row.so,
                win: row.win,
                score: Number(score.toFixed(1)),
            },
        }));
}

function buildMergedMvpGroupBlock(
    periodKey: string,
    items: MvpBoardEntry[],
    periodRecord?: PeriodRecordSlice,
) {
    if (periodRecord) {
        const batting = mergeBattingRowsByPlayerId(periodRecord.batting as BattingAggregateRow[]);
        const pitching = mergePitchingRowsByPlayerId(periodRecord.pitching as PitchingAggregateRow[]);
        return {
            group: 'all',
            batting: pickMvpBattingLeaders(batting, periodKey),
            pitching: pickMvpPitchingLeaders(pitching, periodKey),
        };
    }

    const inPeriod = items.filter((item) => item.key === periodKey);
    return {
        group: 'all',
        batting: pickMvpBattingLeadersFromItems(inPeriod.filter((item) => item.type === 'batting'), periodKey),
        pitching: pickMvpPitchingLeadersFromItems(inPeriod.filter((item) => item.type === 'pitching'), periodKey),
    };
}

function pickMvpBattingLeadersFromItems(items: MvpBoardEntry[], periodKey: string): MvpBoardEntry[] {
    const map = new Map<string, { name: string; h: number; rbi: number; r: number; sb: number; hr: number; avg?: string | number }>();

    for (const item of items) {
        const key = normalizePlayerName(item.name);
        if (!key) continue;

        const stats = item.stats ?? {};
        const rMatch = item.summary.match(/(\d+)득점/);
        const current = map.get(key) ?? { name: item.name, h: 0, rbi: 0, r: 0, sb: 0, hr: 0 };
        current.h += Number(stats.h ?? 0);
        current.rbi += Number(stats.rbi ?? 0);
        current.hr += Number(stats.hr ?? 0);
        current.sb += Number(stats.sb ?? 0);
        current.r += Number(stats.r ?? (rMatch ? Number(rMatch[1]) : 0));
        if (stats.avg != null) current.avg = stats.avg;
        map.set(key, current);
    }

    const rows = [...map.values()].map((row) => ({
        ...row,
        avg: String(row.avg ?? '.000'),
        g: 0,
        pa: 0,
        ab: 0,
        double: 0,
        triple: 0,
        bb: 0,
        hbp: 0,
        so: 0,
        ops: '.000',
        playerId: '',
    })) as BattingAggregateRow[];

    return pickMvpBattingLeaders(rows, periodKey);
}

function pickMvpPitchingLeadersFromItems(items: MvpBoardEntry[], periodKey: string): MvpBoardEntry[] {
    const map = new Map<
        string,
        { name: string; outs: number; so: number; win: number; save: number; er: number; ip?: string | number; era?: string | number }
    >();

    for (const item of items) {
        const key = normalizePlayerName(item.name);
        if (!key) continue;

        const stats = item.stats ?? {};
        const current = map.get(key) ?? { name: item.name, outs: 0, so: 0, win: 0, save: 0, er: 0 };
        current.outs += ipToOuts(stats.ip ?? 0);
        current.so += Number(stats.so ?? 0);
        current.win += Number(stats.win ?? 0);
        current.save += Number(stats.save ?? 0);
        if (stats.ip != null) current.ip = stats.ip;
        if (stats.era != null) current.era = stats.era;
        map.set(key, current);
    }

    const rows = [...map.values()].map((row) => ({
        ...row,
        g: 0,
        h: 0,
        r: 0,
        bb: 0,
        hbp: 0,
        loss: 0,
        ip: String(row.ip ?? '0.0'),
        era: String(row.era ?? '0.00'),
        whip: '0.00',
        playerId: '',
    })) as PitchingAggregateRow[];

    return pickMvpPitchingLeaders(rows, periodKey);
}

export function buildMvpPeriodBlocks(
    items: MvpBoardEntry[],
    mode: 'monthly' | 'weekly',
    groupFilter: string,
    groupIds: string[] = ['A', 'D'],
    periodRecordsByKey: Record<string, PeriodRecordSlice> = {},
): MvpPeriodBlock[] {
    const keys = [...new Set(items.map((item) => item.key))].sort(compareMvpPeriodKeys);

    return keys.map((periodKey) => {
        if (groupFilter === 'all') {
            const periodRecord = mode === 'monthly' ? periodRecordsByKey[periodKey] : undefined;
            return {
                key: periodKey,
                label: formatMvpPeriodKey(periodKey, mode),
                groups: [buildMergedMvpGroupBlock(periodKey, items, periodRecord)],
            };
        }

        const inPeriod = items.filter((item) => item.key === periodKey && item.group === groupFilter);
        return {
            key: periodKey,
            label: formatMvpPeriodKey(periodKey, mode),
            groups: [
                {
                    group: groupFilter,
                    batting: inPeriod
                        .filter((item) => item.type === 'batting')
                        .sort((a, b) => a.rank - b.rank),
                    pitching: inPeriod
                        .filter((item) => item.type === 'pitching')
                        .sort((a, b) => a.rank - b.rank),
                },
            ],
        };
    });
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

/** build-records.js MVP 점수와 동일 */
export function calcMvpBattingScore(row: {
    h?: number;
    rbi?: number;
    r?: number;
    sb?: number;
    hr?: number;
}) {
    return (
        (row.h || 0) * 4 +
        (row.rbi || 0) * 3 +
        (row.r || 0) * 2 +
        (row.sb || 0) * 1.5 +
        (row.hr || 0) * 5
    );
}

export function calcMvpPitchingScore(row: {
    outs?: number;
    so?: number;
    win?: number;
    save?: number;
    er?: number;
}) {
    return (
        (row.outs || 0) * 1.5 +
        (row.so || 0) * 2 +
        (row.win || 0) * 8 +
        (row.save || 0) * 5 -
        (row.er || 0) * 2
    );
}

export type MvpRulesContent = {
    periodLabel: string;
    batting: {
        formula: string;
        weights: { label: string; weight: string }[];
        example: {
            name: string;
            period: string;
            stats: string;
            steps: string[];
            total: string;
        };
    };
    pitching: {
        formula: string;
        weights: { label: string; weight: string }[];
        example: {
            name: string;
            period: string;
            stats: string;
            steps: string[];
            total: string;
        };
    };
};

export function buildMvpRulesContent(mode: 'monthly' | 'weekly'): MvpRulesContent {
    const periodLabel =
        mode === 'monthly'
            ? '해당 월(YYYY-MM)에 치른 경기 기록만 합산합니다.'
            : '해당 주차(월요일 시작)에 치른 경기 기록만 합산합니다.';

    const battingExample = {
        h: 5,
        rbi: 6,
        r: 4,
        sb: 2,
        hr: 1,
    };
    const battingTotal = calcMvpBattingScore(battingExample);

    const pitchingExample = {
        outs: 18,
        so: 8,
        win: 1,
        save: 0,
        er: 3,
    };
    const pitchingTotal = calcMvpPitchingScore(pitchingExample);

    return {
        periodLabel,
        batting: {
            formula: 'MVP 점수 = 안타×4 + 타점×3 + 득점×2 + 도루×1.5 + 홈런×5',
            weights: [
                { label: '안타 (H)', weight: '×4' },
                { label: '타점 (RBI)', weight: '×3' },
                { label: '득점 (R)', weight: '×2' },
                { label: '도루 (SB)', weight: '×1.5' },
                { label: '홈런 (HR)', weight: '×5' },
            ],
            example: {
                name: '선예환',
                period: mode === 'monthly' ? '2026년 5월 A조' : '2026년 5월 3주차 A조',
                stats: '5안타 · 6타점 · 4득점 · 2도루 · 1홈런 (기간 내 경기 합산)',
                steps: [
                    `5×4(안타) = 20`,
                    `6×3(타점) = 18`,
                    `4×2(득점) = 8`,
                    `2×1.5(도루) = 3`,
                    `1×5(홈런) = 5`,
                ],
                total: `${battingTotal.toFixed(1)}점`,
            },
        },
        pitching: {
            formula: 'MVP 점수 = 아웃카운트×1.5 + 탈삼진×2 + 승×8 + 세이브×5 − 자책점×2',
            weights: [
                { label: '아웃카운트 (Outs)', weight: '×1.5' },
                { label: '탈삼진 (SO)', weight: '×2' },
                { label: '승 (W)', weight: '×8' },
                { label: '세이브 (SV)', weight: '×5' },
                { label: '자책점 (ER)', weight: '−×2' },
            ],
            example: {
                name: '박의현',
                period: mode === 'monthly' ? '2026년 5월 D조' : '2026년 5월 3주차 D조',
                stats: '6.0이닝(18 outs) · 8탈삼진 · 1승 · 0세이브 · 3자책 (기간 내 경기 합산)',
                steps: [
                    `18×1.5(아웃) = 27`,
                    `8×2(탈삼진) = 16`,
                    `1×8(승) = 8`,
                    `0×5(세이브) = 0`,
                    `3×2(자책) = −6`,
                ],
                total: `${pitchingTotal.toFixed(1)}점`,
            },
        },
    };
}
