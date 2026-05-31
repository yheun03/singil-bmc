import {
    normalizeText as normalizeKeyText,
    parseNumber,
    ipToOuts,
    outsToIp,
    mapHeaders,
    resolvePlayer,
    createEmptyBattingRow,
    createEmptyPitchingRow,
} from './records-utils.js';

/** 우리팀명 — 포함 여부로만 판단 (상대팀명 제외 방식 사용 금지) */
export const OUR_TEAM_NAMES = ['다윗 야구 선교단', 'Davids 야구 선교단'];

const ROMAN_OUT_MAP = {
    '⅓': 1,
    '⅔': 2,
    '⅕': 1,
    '⅖': 2,
    '⅗': 3,
    '⅘': 4,
};

/** h3 텍스트용 정규화 (공백 하나로 합침) */
export function normalizeTeamText(text = '') {
    return String(text ?? '').replace(/\s+/g, ' ').trim();
}

export function isGameoneFormat($) {
    return (
        $('.record').length > 0 ||
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

export function isOurTeamName(teamName = '') {
    const normalized = normalizeTeamText(teamName);
    return OUR_TEAM_NAMES.some((name) => normalized.includes(name));
}

function mapSummaryLabel(label = '') {
    const normalized = normalizeKeyText(label);

    if (normalized.includes('안타')) return 'hits';
    if (normalized.includes('홈런')) return 'homeRuns';
    if (normalized.includes('도루')) return 'steals';
    if (normalized.includes('삼진')) return 'strikeouts';
    if (normalized.includes('실책')) return 'errors';
    if (normalized.includes('사사구')) return 'walksAndHbp';

    return '';
}

/** 팀명 → 조 (다윗=D, Davids=A) */
export function getGroupFromTeamName(teamName = '') {
    const normalized = normalizeTeamText(teamName);

    if (normalized.includes('Davids')) return 'A';
    if (normalized.includes('다윗')) return 'D';

    return '';
}

export function extractHeadingTeamName($, heading) {
    return normalizeTeamText(
        $(heading)
            .clone()
            .children('img')
            .remove()
            .end()
            .text(),
    );
}

/** h3 바로 다음 table 요소 (중간 텍스트 노드는 건너뜀) */
export function getNextTableElement($, heading) {
    let node = $(heading).next();

    while (node.length) {
        const tagName = (node.prop('tagName') || '').toLowerCase();

        if (tagName === 'table') {
            return node;
        }

        if (tagName && tagName !== '#text') {
            break;
        }

        node = node.next();
    }

    return null;
}

/**
 * .record 영역에서 h3 + next table 기준으로 우리팀 테이블만 수집
 */
export function getOurTeamRecordTables($) {
    const result = {
        hitters: [],
        pitchers: [],
        opponentHitters: [],
        teamGroups: [],
    };

    const recordArea = $('.record').first();
    if (!recordArea.length) {
        return result;
    }

    recordArea.find('h3').each((_, headingEl) => {
        const teamName = extractHeadingTeamName($, headingEl);
        const table = getNextTableElement($, headingEl);

        if (!table || !table.length) {
            return;
        }

        const summary = String(table.attr('summary') ?? '');

        if (isOurTeamName(teamName)) {
            const group = getGroupFromTeamName(teamName);
            if (group) {
                result.teamGroups.push(group);
            }

            if (summary.includes('타자')) {
                result.hitters.push({ table, group });
            }

            if (summary.includes('투수')) {
                result.pitchers.push({ table, group });
            }

            return;
        }

        if (summary.includes('타자')) {
            result.opponentHitters.push(table);
        }
    });

    return result;
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

function applyRecordGroup(player, recordGroup) {
    return {
        ...player,
        group: recordGroup || player.group || '',
    };
}

export function parseGameoneBattingTable($, table, playersMap, tempCounter, defaultGroup = '') {
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

            const player = applyRecordGroup(resolvePlayer(name, playersMap, tempCounter), defaultGroup);
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

export function parseGameonePitchingTable($, table, playersMap, tempCounter, defaultGroup = '') {
    const headers = $(table)
        .find('thead th')
        .toArray()
        .map((el) => $(el).text().trim());

    const mapping = {
        ...mapHeaders(headers),
        result: headers.findIndex((header) => normalizeKeyText(header).includes('결과')),
    };

    const rows = [];

    $(table)
        .find('tbody tr')
        .each((_, rowEl) => {
            const name = extractPlayerName($, rowEl);
            if (!name) return;

            const player = applyRecordGroup(resolvePlayer(name, playersMap, tempCounter), defaultGroup);
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

export function parseGameoneSummary($) {
    const scoreArea = $('.summary .score_sum').first();
    const result = {
        summary: null,
        opponentSummary: null,
        highlights: [],
    };

    if (!scoreArea.length) {
        return result;
    }

    scoreArea.find('.team').each((_, teamEl) => {
        const team = $(teamEl);
        const teamName = normalizeTeamText(team.find('h4').first().text());
        const stats = { teamName };
        const terms = team.find('dt').toArray();
        const values = team.find('dd').toArray();

        terms.forEach((termEl, index) => {
            const key = mapSummaryLabel($(termEl).text());
            if (!key) return;
            stats[key] = parseNumber($(values[index]).text());
        });

        if (isOurTeamName(teamName)) {
            const { teamName: _teamName, ...ourStats } = stats;
            result.summary = ourStats;
        } else if (!result.opponentSummary) {
            result.opponentSummary = stats;
        }
    });

    scoreArea.find('ul.game_sum li').each((_, itemEl) => {
        const item = $(itemEl);
        const type = item
            .find('strong')
            .first()
            .text()
            .replace(/[\[\]]/g, '')
            .trim();
        const text = item
            .clone()
            .find('strong')
            .remove()
            .end()
            .text()
            .replace(/\s+/g, ' ')
            .trim();

        if (type && text) {
            result.highlights.push({ type, text });
        }
    });

    return result;
}

export function parseGameoneHtml($, playersMap, tempCounter) {
    const tables = getOurTeamRecordTables($);

    let batting = [];
    let pitching = [];

    for (const { table, group } of tables.hitters) {
        batting = batting.concat(parseGameoneBattingTable($, table, playersMap, tempCounter, group));
    }

    for (const { table, group } of tables.pitchers) {
        pitching = pitching.concat(parseGameonePitchingTable($, table, playersMap, tempCounter, group));
    }

    const ourBattingTable = tables.hitters[0]?.table ?? null;
    const opponentBattingTable = tables.opponentHitters[0] ?? null;

    const ourRuns = ourBattingTable ? extractRunsFromBattingFoot($, ourBattingTable) : null;
    const opponentRuns = opponentBattingTable ? extractRunsFromBattingFoot($, opponentBattingTable) : null;

    const gameGroup = tables.teamGroups[0] ?? batting[0]?.group ?? pitching[0]?.group ?? '';
    const summary = parseGameoneSummary($);

    return {
        batting,
        pitching,
        group: gameGroup,
        score: {
            our: ourRuns ?? 0,
            opponent: opponentRuns ?? 0,
        },
        ...summary,
    };
}
