import {
    normalizeText,
    parseNumber,
    ipToOuts,
    outsToIp,
    mapHeaders,
    resolvePlayer,
    createEmptyBattingRow,
    createEmptyPitchingRow,
} from './records-utils.js';

export const OUR_TEAM_KEYWORDS = ['다윗야구선교단', '다윗', '신길교회'];

const ROMAN_OUT_MAP = {
    '⅓': 1,
    '⅔': 2,
    '⅕': 1,
    '⅖': 2,
    '⅗': 3,
    '⅘': 4,
};

export function isGameoneFormat($) {
    return (
        $('[summary="타자기록"], [summary="투수기록"], .record_table').length > 0 ||
        $('.article.on').length > 0
    );
}

export function parseGameoneIp(value) {
    const text = String(value ?? '')
        .trim()
        .replace(/\s+/g, ' ');

    if (!text || text === '-') return 0;

    const romanMatch = text.match(/^(\d+)\s+([⅓⅔⅕⅖⅗⅘])$/);
    if (romanMatch) {
        const whole = parseInt(romanMatch[1], 10);
        const outs = ROMAN_OUT_MAP[romanMatch[2]] ?? 0;
        return whole * 3 + outs;
    }

    return ipToOuts(text);
}

export function isOurTeamName(teamName) {
    const normalized = normalizeText(teamName);
    return OUR_TEAM_KEYWORDS.some((keyword) => normalized.includes(normalizeText(keyword)));
}

export function getTableTeamName($, table) {
    const heading = $(table).prevAll('h3').first();
    return heading
        .text()
        .replace(/\s+/g, ' ')
        .trim();
}

export function getTableTypeFromSummary($, table) {
    const summary = String($(table).attr('summary') ?? '').trim();

    if (summary.includes('타자')) return 'batting';
    if (summary.includes('투수')) return 'pitching';

    return null;
}

export function extractPlayerName($, rowEl) {
    const row = $(rowEl);
    const th = row.find('th').first();
    const strong = th.find('strong').first().text().trim();

    if (strong) {
        return strong.replace(/\(\d+\)$/, '').trim();
    }

    return th
        .text()
        .replace(/\(\d+\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function getStatFromRow($, rowEl, mapping, field) {
    const headerIndex = mapping[field];
    if (headerIndex === undefined) return 0;

    const tds = $(rowEl).find('td');
    const tdIndex = headerIndex - 1;

    if (tdIndex < 0 || tdIndex >= tds.length) return 0;

    return parseNumber($(tds[tdIndex]).text().trim());
}

function getStatTextFromRow($, rowEl, mapping, field) {
    const headerIndex = mapping[field];
    if (headerIndex === undefined) return '';

    const tds = $(rowEl).find('td');
    const tdIndex = headerIndex - 1;

    if (tdIndex < 0 || tdIndex >= tds.length) return '';

    return $(tds[tdIndex]).text().trim();
}

export function parseGameoneBattingTable($, table, playersMap, tempCounter) {
    const headers = $(table)
        .find('thead th')
        .toArray()
        .map((el) => $(el).text().trim());

    const mapping = mapHeaders(headers);
    const rows = [];

    $(table)
        .find('tbody tr')
        .each((_, rowEl) => {
            const name = extractPlayerName($, rowEl);
            if (!name) return;

            const player = resolvePlayer(name, playersMap, tempCounter);
            const batting = createEmptyBattingRow(player);

            batting.ab = getStatFromRow($, rowEl, mapping, 'ab');
            batting.h = getStatFromRow($, rowEl, mapping, 'h');
            batting.rbi = getStatFromRow($, rowEl, mapping, 'rbi');
            batting.r = getStatFromRow($, rowEl, mapping, 'r');
            batting.sb = getStatFromRow($, rowEl, mapping, 'sb');
            batting.pa = batting.ab;

            rows.push(batting);
        });

    return rows;
}

export function parseGameonePitchingTable($, table, playersMap, tempCounter) {
    const headers = $(table)
        .find('thead th')
        .toArray()
        .map((el) => $(el).text().trim());

    const mapping = {
        ...mapHeaders(headers),
        result: headers.findIndex((header) => normalizeText(header).includes('결과')),
    };

    const rows = [];

    $(table)
        .find('tbody tr')
        .each((_, rowEl) => {
            const name = extractPlayerName($, rowEl);
            if (!name) return;

            const player = resolvePlayer(name, playersMap, tempCounter);
            const pitching = createEmptyPitchingRow(player);

            const ipText = getStatTextFromRow($, rowEl, mapping, 'ip');
            const outs = parseGameoneIp(ipText);

            pitching.outs = outs;
            pitching.ip = outsToIp(outs);
            pitching.h = getStatFromRow($, rowEl, mapping, 'pitH');
            pitching.r = getStatFromRow($, rowEl, mapping, 'pitR');
            pitching.er = getStatFromRow($, rowEl, mapping, 'er');
            pitching.bb = getStatFromRow($, rowEl, mapping, 'bb');
            pitching.hbp = getStatFromRow($, rowEl, mapping, 'hbp');
            pitching.so = getStatFromRow($, rowEl, mapping, 'so');

            const resultText = getStatTextFromRow($, rowEl, { result: mapping.result }, 'result');
            if (resultText.includes('승')) pitching.win = 1;
            if (resultText.includes('패')) pitching.loss = 1;
            if (resultText.includes('세') || resultText.toLowerCase().includes('sv')) pitching.save = 1;

            rows.push(pitching);
        });

    return rows;
}

export function extractFootStat($, table, field) {
    const headers = $(table)
        .find('thead th')
        .toArray()
        .map((el) => $(el).text().trim());

    const mapping = mapHeaders(headers);
    const statOrder = ['ab', 'h', 'rbi', 'r', 'sb'].filter((key) => mapping[key] !== undefined);
    const fieldIndex = statOrder.indexOf(field);

    if (fieldIndex < 0) return null;

    const tfootTds = $(table).find('tfoot tr').last().find('td');
    if (fieldIndex >= tfootTds.length) return null;

    return parseNumber($(tfootTds[fieldIndex]).text().trim(), null);
}

export function extractRunsFromBattingFoot($, table) {
    return extractFootStat($, table, 'r');
}

export function parseGameoneHighlights($) {
    const highlights = {
        hr: new Map(),
        double: new Map(),
        triple: new Map(),
    };

    $('.game_sum li').each((_, li) => {
        const text = $(li).text().replace(/\s+/g, ' ').trim();
        const match = text.match(/^\[(.+?)\]\s*(.*)$/);
        if (!match) return;

        const category = match[1];
        const body = match[2].trim();
        if (!body) return;

        const names = body.match(/([가-힣A-Za-z]+)(?:\([^)]*\))?/g) ?? [];

        for (const entry of names) {
            const nameMatch = entry.match(/^([가-힣A-Za-z]+)/);
            if (!nameMatch) continue;

            const name = nameMatch[1].trim();
            if (!name) continue;

            if (category === '홈런') highlights.hr.set(name, (highlights.hr.get(name) ?? 0) + 1);
            if (category === '2루타') highlights.double.set(name, (highlights.double.get(name) ?? 0) + 1);
            if (category === '3루타') highlights.triple.set(name, (highlights.triple.get(name) ?? 0) + 1);
        }
    });

    return highlights;
}

export function applyHighlightsToBatting(batting, highlights) {
    return batting.map((row) => ({
        ...row,
        hr: highlights.hr.get(row.name) ?? row.hr ?? 0,
        double: highlights.double.get(row.name) ?? row.double ?? 0,
        triple: highlights.triple.get(row.name) ?? row.triple ?? 0,
    }));
}

export function parseGameoneHtml($, playersMap, tempCounter) {
    let batting = [];
    let pitching = [];
    let ourRuns = null;
    let opponentRuns = null;

    $('table').each((_, table) => {
        const teamName = getTableTeamName($, table);
        const tableType = getTableTypeFromSummary($, table);

        if (!tableType) return;

        if (isOurTeamName(teamName)) {
            if (tableType === 'batting') {
                batting = parseGameoneBattingTable($, table, playersMap, tempCounter);
                ourRuns = extractRunsFromBattingFoot($, table);
            } else if (tableType === 'pitching') {
                pitching = parseGameonePitchingTable($, table, playersMap, tempCounter);
            }
            return;
        }

        if (tableType === 'batting') {
            opponentRuns = extractRunsFromBattingFoot($, table);
        }
    });

    const highlights = parseGameoneHighlights($);
    batting = applyHighlightsToBatting(batting, highlights);

    return {
        batting,
        pitching,
        score: {
            our: ourRuns ?? 0,
            opponent: opponentRuns ?? 0,
        },
    };
}
