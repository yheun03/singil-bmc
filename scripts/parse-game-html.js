import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import * as cheerio from 'cheerio';
import {
    RAW_GAMES_DIR,
    GAMES_DIR,
    ensureDir,
    writeJson,
    listFiles,
    parseGameFilename,
    loadPlayersMap,
    resolvePlayer,
    createEmptyBattingRow,
    createEmptyPitchingRow,
    detectTableType,
    mapHeaders,
    parseNumber,
    ipToOuts,
    outsToIp,
    extractScoreFromHtml,
    extractGroupFromHtml,
} from './lib/records-utils.js';
import { isGameoneFormat, parseGameoneHtml } from './lib/gameone-parser.js';

function getCellText(cells, index) {
    if (index === undefined || index < 0 || index >= cells.length) {
        return '';
    }

    return cells.eq(index).text().trim();
}

function parseSimpleBattingTable($, table, playersMap, tempCounter) {
    const headers = $(table)
        .find('thead th')
        .toArray()
        .map((el) => $(el).text().trim());

    const mapping = mapHeaders(headers);
    const rows = [];

    $(table)
        .find('tbody tr')
        .each((_, rowEl) => {
            const cells = $(rowEl).find('td');
            if (!cells.length) return;

            const name = getCellText(cells, mapping.name);
            if (!name) return;

            const player = resolvePlayer(name, playersMap, tempCounter);
            const batting = createEmptyBattingRow(player);

            batting.pa = parseNumber(getCellText(cells, mapping.pa));
            batting.ab = parseNumber(getCellText(cells, mapping.ab));
            batting.r = parseNumber(getCellText(cells, mapping.r));
            batting.h = parseNumber(getCellText(cells, mapping.h));
            batting.double = parseNumber(getCellText(cells, mapping.double));
            batting.triple = parseNumber(getCellText(cells, mapping.triple));
            batting.hr = parseNumber(getCellText(cells, mapping.hr));
            batting.rbi = parseNumber(getCellText(cells, mapping.rbi));
            batting.bb = parseNumber(getCellText(cells, mapping.bb));
            batting.hbp = parseNumber(getCellText(cells, mapping.hbp));
            batting.so = parseNumber(getCellText(cells, mapping.so));
            batting.sb = parseNumber(getCellText(cells, mapping.sb));

            if (!batting.pa && batting.ab) {
                batting.pa = batting.ab + batting.bb + batting.hbp;
            }

            rows.push(batting);
        });

    return rows;
}

function parseSimplePitchingTable($, table, playersMap, tempCounter) {
    const headers = $(table)
        .find('thead th')
        .toArray()
        .map((el) => $(el).text().trim());

    const mapping = mapHeaders(headers);
    const rows = [];

    $(table)
        .find('tbody tr')
        .each((_, rowEl) => {
            const cells = $(rowEl).find('td');
            if (!cells.length) return;

            const name = getCellText(cells, mapping.name);
            if (!name) return;

            const player = resolvePlayer(name, playersMap, tempCounter);
            const pitching = createEmptyPitchingRow(player);

            const ipText = getCellText(cells, mapping.ip);
            const outs = ipToOuts(ipText);

            pitching.outs = outs;
            pitching.ip = outsToIp(outs);
            pitching.h = parseNumber(getCellText(cells, mapping.pitH ?? mapping.h));
            pitching.r = parseNumber(getCellText(cells, mapping.pitR ?? mapping.r));
            pitching.er = parseNumber(getCellText(cells, mapping.er));
            pitching.bb = parseNumber(getCellText(cells, mapping.bb));
            pitching.hbp = parseNumber(getCellText(cells, mapping.hbp));
            pitching.so = parseNumber(getCellText(cells, mapping.so));
            pitching.win = parseNumber(getCellText(cells, mapping.win));
            pitching.loss = parseNumber(getCellText(cells, mapping.loss));
            pitching.save = parseNumber(getCellText(cells, mapping.save));

            rows.push(pitching);
        });

    return rows;
}

function parseSimpleGameHtml($, bodyText, playersMap, tempCounter) {
    let batting = [];
    let pitching = [];

    $('table').each((_, table) => {
        const type = detectTableType(table, $);

        if (type === 'batting') {
            batting = batting.concat(parseSimpleBattingTable($, table, playersMap, tempCounter));
        } else if (type === 'pitching') {
            pitching = pitching.concat(parseSimplePitchingTable($, table, playersMap, tempCounter));
        }
    });

    return {
        batting,
        pitching,
        score: extractScoreFromHtml($, bodyText),
    };
}

function parseGameHtmlFile(filePath, playersMap, tempCounter) {
    const filename = path.basename(filePath);
    const meta = parseGameFilename(filename);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    const bodyText = $('body').text();

    const parsed = isGameoneFormat($)
        ? parseGameoneHtml($, playersMap, tempCounter)
        : parseSimpleGameHtml($, bodyText, playersMap, tempCounter);

    const group = extractGroupFromHtml(bodyText) || parsed.batting[0]?.group || parsed.pitching[0]?.group || '';

    return {
        gameId: meta.gameId,
        gameDate: meta.gameDate,
        year: meta.year,
        month: meta.month,
        opponent: meta.opponent,
        group,
        status: 'completed',
        score: parsed.score,
        batting: parsed.batting,
        pitching: parsed.pitching,
    };
}

export function parseAllGameHtmlFiles() {
    ensureDir(GAMES_DIR);

    const playersMap = loadPlayersMap();
    const tempCounter = { value: 0 };
    const htmlFiles = listFiles(RAW_GAMES_DIR, '.html');

    if (!htmlFiles.length) {
        console.log('[INFO] raw-games HTML 파일이 없습니다.');
        return [];
    }

    const games = [];

    for (const filename of htmlFiles) {
        const filePath = path.join(RAW_GAMES_DIR, filename);

        try {
            const game = parseGameHtmlFile(filePath, playersMap, tempCounter);
            const outputPath = path.join(GAMES_DIR, `${game.gameId}.json`);
            writeJson(outputPath, game);
            games.push(game);
            console.log(`[OK] ${filename} → games/${game.gameId}.json`);
        } catch (error) {
            console.error(`[ERROR] ${filename}: ${error.message}`);
        }
    }

    return games;
}

function main() {
    console.log('=== parse-game-html ===');
    const games = parseAllGameHtmlFiles();
    console.log(`완료: ${games.length}개 경기 JSON 생성`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}
