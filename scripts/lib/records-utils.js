import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '../..');
export const DATA_DIR = path.join(ROOT_DIR, 'public/data');
export const RAW_GAMES_DIR = path.join(DATA_DIR, 'raw-games');
export const GAMES_DIR = path.join(DATA_DIR, 'games');
export const SUMMARY_DIR = path.join(DATA_DIR, 'summary');
export const META_DIR = path.join(DATA_DIR, 'meta');
export const MANUAL_DIR = path.join(DATA_DIR, 'manual');
export const GENERATED_DIR = path.join(DATA_DIR, 'generated');

export function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

export function readJson(filePath, fallback = null) {
    if (!fs.existsSync(filePath)) {
        return fallback;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

export function writeJson(filePath, data) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function resetDir(dirPath) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    ensureDir(dirPath);
}

export function listFiles(dirPath, extension) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    return fs
        .readdirSync(dirPath)
        .filter((name) => name.toLowerCase().endsWith(extension))
        .sort();
}

export function normalizeText(value) {
    return String(value ?? '')
        .replace(/\s+/g, '')
        .replace(/[·•]/g, '')
        .toLowerCase();
}

/** GameOne h3/h4 팀명 비교용 (공백만 정규화) */
export function normalizeTeamText(text = '') {
    return String(text ?? '').replace(/\s+/g, ' ').trim();
}

export function parseNumber(value, fallback = 0) {
    if (value === null || value === undefined) return fallback;

    const text = String(value).trim();
    if (!text || text === '-' || text === '—') return fallback;

    const cleaned = text.replace(/,/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : fallback;
}

export function ipToOuts(ipValue) {
    const text = String(ipValue ?? '').trim();
    if (!text || text === '-') return 0;

    const match = text.match(/^(\d+)(?:\.(\d))?$/);
    if (!match) {
        const num = parseNumber(text, 0);
        const whole = Math.floor(num);
        const fracDigit = Math.round((num - whole) * 10);
        return whole * 3 + Math.min(Math.max(fracDigit, 0), 2);
    }

    const whole = parseInt(match[1], 10);
    const fracDigit = match[2] ? parseInt(match[2], 10) : 0;
    return whole * 3 + Math.min(Math.max(fracDigit, 0), 2);
}

export function outsToIp(outs) {
    const safeOuts = Math.max(0, parseNumber(outs, 0));
    const whole = Math.floor(safeOuts / 3);
    const remainder = safeOuts % 3;
    return remainder === 0 ? `${whole}.0` : `${whole}.${remainder}`;
}

export function ipFromOuts(outs) {
    return outsToIp(outs);
}

export function formatAvg(value) {
    if (!Number.isFinite(value)) return '.000';
    return value.toFixed(3).replace(/^0(?=\.)/, '');
}

export function formatRate(value, digits = 2) {
    if (!Number.isFinite(value)) return (0).toFixed(digits);
    return value.toFixed(digits);
}

export function parseGameFilename(filename) {
    const match = filename.match(/^(\d{4}-\d{2})[-.](\d{2})-vs-(.+)\.html$/i);
    if (!match) {
        throw new Error(`Invalid game filename: ${filename}`);
    }

    const gameDate = `${match[1]}-${match[2]}`;
    const opponent = match[3];
    const [yearText, monthText] = gameDate.split('-');

    return {
        gameId: `${gameDate}-vs-${opponent}`,
        gameDate,
        year: parseInt(yearText, 10),
        month: parseInt(monthText, 10),
        opponent,
    };
}

export function loadPlayersMap() {
    const players = readJson(path.join(META_DIR, 'players.json'), []);
    const byGameoneName = new Map();

    for (const player of players) {
        const key = normalizeText(player.gameoneName || player.name);
        const entries = byGameoneName.get(key) || [];
        entries.push(player);
        byGameoneName.set(key, entries);
    }

    return { players, byGameoneName };
}

export function resolvePlayer(name, playersMap, tempCounter) {
    const key = normalizeText(name);
    const matches = playersMap.byGameoneName.get(key) || [];
    const matched = matches[0];

    if (matched) {
        return {
            playerId: matched.playerId,
            name: matched.name,
            group: matched.group,
            gameoneClubId: matched.gameoneClubId || '',
            gameoneClubIds: [...new Set(matches.map((entry) => entry.gameoneClubId).filter(Boolean))],
        };
    }

    if (!tempCounter.unknownByName) {
        tempCounter.unknownByName = new Map();
    }

    const existing = tempCounter.unknownByName.get(key);
    if (existing) {
        return existing;
    }

    tempCounter.value += 1;
    const tempId = `temp-${String(tempCounter.value).padStart(3, '0')}`;
    console.warn(`[WARN] players.json에서 매칭되지 않은 선수명: "${name}"`);

    const player = {
        playerId: tempId,
        name,
        group: '',
        gameoneClubId: '',
        gameoneClubIds: [],
    };

    tempCounter.unknownByName.set(key, player);
    return player;
}

export function createEmptyBattingRow(player) {
    return {
        playerId: player.playerId,
        name: player.name,
        group: player.group,
        gameoneClubId: player.gameoneClubId || '',
        gameoneClubIds: player.gameoneClubIds || [],
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
    };
}

export function createEmptyPitchingRow(player) {
    return {
        playerId: player.playerId,
        name: player.name,
        group: player.group,
        gameoneClubId: player.gameoneClubId || '',
        gameoneClubIds: player.gameoneClubIds || [],
        ip: '0.0',
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
    };
}

export function calcBattingDerived(stats) {
    const singles = Math.max(0, stats.h - stats.double - stats.triple - stats.hr);
    const tb = singles + stats.double * 2 + stats.triple * 3 + stats.hr * 4;
    const avg = stats.ab > 0 ? stats.h / stats.ab : 0;
    const obpDen = stats.ab + stats.bb + stats.hbp;
    const obp = obpDen > 0 ? (stats.h + stats.bb + stats.hbp) / obpDen : 0;
    const slg = stats.ab > 0 ? tb / stats.ab : 0;

    return {
        singles,
        tb,
        avg,
        obp,
        slg,
        ops: obp + slg,
    };
}

export function calcPitchingDerived(stats) {
    const wholeInnings = Math.floor(stats.outs / 3);
    const partialInnings = (stats.outs % 3) * 0.33;
    const ipDecimal = wholeInnings + partialInnings;
    const era = ipDecimal > 0 ? (stats.er * 7) / ipDecimal : 0;
    const whip = ipDecimal > 0 ? (stats.h + stats.bb) / ipDecimal : 0;

    return {
        ipDecimal,
        era,
        whip,
    };
}

export function detectTableType(table, $) {
    const caption = normalizeText($(table).find('caption').first().text());
    const headers = $(table)
        .find('thead th')
        .toArray()
        .map((el) => normalizeText($(el).text()));

    const headerText = headers.join('');
    const contextText = normalizeText(
        [
            caption,
            headerText,
            $(table).prevAll('h1,h2,h3,h4,h5,h6,p,strong').first().text(),
        ].join(''),
    );

    const hasExactHeader = (keyword) =>
        headers.some((header) => header === normalizeText(keyword) || header.includes(normalizeText(keyword)));

    const hasBattingColumns =
        hasExactHeader('타수') ||
        hasExactHeader('타점') ||
        hasExactHeader('득점') ||
        hasExactHeader('타석') ||
        headers.some((header) => header === '안타');

    const hasPitchingColumns =
        hasExactHeader('이닝') ||
        hasExactHeader('피안타') ||
        hasExactHeader('자책') ||
        hasExactHeader('자책점') ||
        hasExactHeader('탈삼진');

    if (contextText.includes('투수') || contextText.includes('pitching')) {
        if (hasPitchingColumns) return 'pitching';
    }

    if (contextText.includes('타자') || contextText.includes('batting')) {
        if (hasBattingColumns) return 'batting';
    }

    if (hasPitchingColumns && !hasBattingColumns) return 'pitching';
    if (hasBattingColumns && !hasPitchingColumns) return 'batting';
    if (hasPitchingColumns && hasBattingColumns) {
        return hasExactHeader('이닝') ? 'pitching' : 'batting';
    }

    return 'unknown';
}

const COLUMN_ALIASES = {
    name: ['선수명', '이름', '타자', '투수', 'name', 'player'],
    pa: ['타석', 'pa'],
    ab: ['타수', 'ab'],
    r: ['득점', 'r'],
    pitR: ['실점'],
    h: ['안타', 'h'],
    pitH: ['피안타'],
    double: ['2루타', '2b', 'twobase'],
    triple: ['3루타', '3b', 'threebase'],
    hr: ['홈런', 'hr'],
    rbi: ['타점', 'rbi'],
    bb: ['볼넷', 'bb', '사사구'],
    hbp: ['사구', 'hbp', '몸에맞는볼'],
    so: ['삼진', 'so', '탈삼진'],
    sb: ['도루', 'sb'],
    ip: ['이닝', 'ip'],
    er: ['자책', '자책점', 'er'],
    win: ['승', 'w'],
    loss: ['패', 'l'],
    save: ['세이브', 'sv', 'save'],
};

export function mapHeaders(headers) {
    const mapping = {};

    headers.forEach((header, index) => {
        const normalized = normalizeText(header);

        for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
            if (aliases.some((alias) => normalized.includes(normalizeText(alias)))) {
                if (mapping[field] === undefined) {
                    mapping[field] = index;
                }
            }
        }
    });

    return mapping;
}

export function extractScoreFromHtml($, bodyText) {
    const scorePatterns = [
        /스코어\s*[:：]?\s*(\d+)\s*[-–]\s*(\d+)/i,
        /score\s*[:：]?\s*(\d+)\s*[-–]\s*(\d+)/i,
    ];

    for (const pattern of scorePatterns) {
        const match = bodyText.match(pattern);
        if (match) {
            return {
                our: parseInt(match[1], 10),
                opponent: parseInt(match[2], 10),
            };
        }
    }

    return { our: 0, opponent: 0 };
}

export function extractGroupFromHtml(bodyText) {
    const match = bodyText.match(/조\s*[:：]?\s*([ADad])\s*조?/);
    if (match) {
        return match[1].toUpperCase();
    }

    return '';
}
