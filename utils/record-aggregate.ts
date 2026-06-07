type CountingRecord = Record<string, string | number | undefined>;

function normalizePlayerName(name: string) {
    return String(name ?? '').replace(/\s+/g, '').trim();
}

function formatAvg(value: number) {
    if (!Number.isFinite(value)) return '.000';
    return value.toFixed(3).replace(/^0(?=\.)/, '');
}

function formatRate(value: number, digits = 2) {
    if (!Number.isFinite(value)) return (0).toFixed(digits);
    return value.toFixed(digits);
}

function outsToIp(outs: number) {
    const safeOuts = Math.max(0, outs);
    const whole = Math.floor(safeOuts / 3);
    const remainder = safeOuts % 3;
    return remainder === 0 ? `${whole}.0` : `${whole}.${remainder}`;
}

export type BattingAggregateRow = {
    playerId: string;
    name: string;
    group?: string;
    g: number;
    pa: number;
    ab: number;
    r: number;
    h: number;
    double: number;
    triple: number;
    hr: number;
    rbi: number;
    bb: number;
    hbp: number;
    so: number;
    sb: number;
    tb?: number;
    avg: string;
    obp?: string;
    slg?: string;
    ops: string;
};

export type PitchingAggregateRow = {
    playerId: string;
    name: string;
    group?: string;
    g: number;
    outs: number;
    h: number;
    r: number;
    er: number;
    bb: number;
    hbp: number;
    so: number;
    win: number;
    loss?: number;
    save?: number;
    ip: string;
    era: string;
    whip: string;
};

function calcBattingDerived(stats: Pick<BattingAggregateRow, 'ab' | 'h' | 'double' | 'triple' | 'hr' | 'bb' | 'hbp'>) {
    const singles = Math.max(0, stats.h - stats.double - stats.triple - stats.hr);
    const tb = singles + stats.double * 2 + stats.triple * 3 + stats.hr * 4;
    const avg = stats.ab > 0 ? stats.h / stats.ab : 0;
    const obpDen = stats.ab + stats.bb + stats.hbp;
    const obp = obpDen > 0 ? (stats.h + stats.bb + stats.hbp) / obpDen : 0;
    const slg = stats.ab > 0 ? tb / stats.ab : 0;

    return { tb, avg, obp, slg, ops: obp + slg };
}

function calcPitchingDerived(stats: Pick<PitchingAggregateRow, 'outs' | 'h' | 'bb' | 'er'>) {
    const ipDecimal = stats.outs / 3;
    const era = ipDecimal > 0 ? (stats.er * 7) / ipDecimal : 0;
    const whip = ipDecimal > 0 ? (stats.h + stats.bb) / ipDecimal : 0;
    return { ipDecimal, era, whip };
}

function addNumericFields(target: CountingRecord, source: CountingRecord, fields: string[]) {
    for (const field of fields) {
        target[field] = Number(target[field] ?? 0) + Number(source[field] ?? 0);
    }
}

function mergeKey(row: { playerId?: string; name: string }) {
    const playerId = String(row.playerId ?? '').trim();
    if (playerId) return playerId;
    return `name:${normalizePlayerName(row.name)}`;
}

/** 조 구분 없이 같은 playerId(등록) 기준으로 합산. 이름만 같고 id가 다르면 별도 행 유지 */
export function mergeBattingRowsByPlayerId<T extends BattingAggregateRow>(rows: T[]): BattingAggregateRow[] {
    const map = new Map<string, BattingAggregateRow>();

    for (const row of rows) {
        const key = mergeKey(row);
        if (!key || key === 'name:') continue;

        const current = map.get(key) ?? {
            playerId: row.playerId,
            name: row.name,
            g: 0,
            pa: 0,
            ab: 0,
            r: 0,
            h: 0,
            double: 0,
            triple: 0,
            hr: 0,
            rbi: 0,
            bb: 0,
            hbp: 0,
            so: 0,
            sb: 0,
            avg: '.000',
            ops: '.000',
        };

        addNumericFields(current, row, ['g', 'pa', 'ab', 'r', 'h', 'double', 'triple', 'hr', 'rbi', 'bb', 'hbp', 'so', 'sb']);

        map.set(key, current);
    }

    return [...map.values()]
        .map((stats) => {
            const derived = calcBattingDerived(stats);
            return {
                ...stats,
                tb: derived.tb,
                avg: formatAvg(derived.avg),
                obp: formatAvg(derived.obp),
                slg: formatAvg(derived.slg),
                ops: formatAvg(derived.ops),
            };
        })
        .sort((a, b) => b.ab - a.ab || a.name.localeCompare(b.name, 'ko'));
}

/** 조 구분 없이 같은 playerId(등록) 기준으로 합산. 이름만 같고 id가 다르면 별도 행 유지 */
export function mergePitchingRowsByPlayerId<T extends PitchingAggregateRow>(rows: T[]): PitchingAggregateRow[] {
    const map = new Map<string, PitchingAggregateRow>();

    for (const row of rows) {
        const key = mergeKey(row);
        if (!key || key === 'name:') continue;

        const current = map.get(key) ?? {
            playerId: row.playerId,
            name: row.name,
            g: 0,
            outs: 0,
            h: 0,
            r: 0,
            er: 0,
            bb: 0,
            hbp: 0,
            so: 0,
            win: 0,
            loss: 0,
            save: 0,
            ip: '0.0',
            era: '0.00',
            whip: '0.00',
        };

        addNumericFields(current, row, ['g', 'outs', 'h', 'r', 'er', 'bb', 'hbp', 'so', 'win', 'loss', 'save']);

        map.set(key, current);
    }

    return [...map.values()]
        .map((stats) => {
            const derived = calcPitchingDerived(stats);
            return {
                ...stats,
                ip: outsToIp(stats.outs),
                era: formatRate(derived.era),
                whip: formatRate(derived.whip),
            };
        })
        .sort((a, b) => b.outs - a.outs || a.name.localeCompare(b.name, 'ko'));
}

/** @deprecated mergeBattingRowsByPlayerId 사용 */
export const mergeBattingRowsByName = mergeBattingRowsByPlayerId;

/** @deprecated mergePitchingRowsByPlayerId 사용 */
export const mergePitchingRowsByName = mergePitchingRowsByPlayerId;

export type PeriodRecordSlice = {
    games: number;
    hits: number;
    runs: number;
    batting: Array<Record<string, string | number>>;
    pitching: Array<Record<string, string | number>>;
    groups?: Record<string, PeriodRecordSlice>;
};

/** 전체: playerId 기준 통합(재등록 시 별도 행) / 조 선택: 해당 조 기록 */
export function buildPeriodRecordView(record: PeriodRecordSlice | null, groupId: string) {
    if (!record) return null;

    if (groupId !== 'all') {
        return record.groups?.[groupId] ?? null;
    }

    return {
        games: record.games,
        hits: record.hits,
        runs: record.runs,
        batting: mergeBattingRowsByPlayerId(record.batting as BattingAggregateRow[]),
        pitching: mergePitchingRowsByPlayerId(record.pitching as PitchingAggregateRow[]),
    };
}
