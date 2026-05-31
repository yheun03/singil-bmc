import path from 'path';
import { pathToFileURL } from 'url';
import {
    GAMES_DIR,
    SUMMARY_DIR,
    META_DIR,
    ensureDir,
    readJson,
    writeJson,
    listFiles,
    calcBattingDerived,
    calcPitchingDerived,
    formatAvg,
    formatRate,
    outsToIp,
} from './lib/records-utils.js';

function loadAllGames() {
    const files = listFiles(GAMES_DIR, '.json');
    return files.map((filename) => readJson(path.join(GAMES_DIR, filename))).filter(Boolean);
}

function aggregateBatting(games) {
    const map = new Map();

    for (const game of games) {
        for (const row of game.batting || []) {
            const key = row.playerId;
            const current = map.get(key) || {
                playerId: row.playerId,
                name: row.name,
                group: row.group,
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
            };

            current.g += 1;
            current.pa += row.pa || 0;
            current.ab += row.ab || 0;
            current.r += row.r || 0;
            current.h += row.h || 0;
            current.double += row.double || 0;
            current.triple += row.triple || 0;
            current.hr += row.hr || 0;
            current.rbi += row.rbi || 0;
            current.bb += row.bb || 0;
            current.hbp += row.hbp || 0;
            current.so += row.so || 0;
            current.sb += row.sb || 0;

            if (!current.group && row.group) {
                current.group = row.group;
            }

            map.set(key, current);
        }
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
        .sort((a, b) => b.ab - a.ab);
}

function aggregatePitching(games) {
    const map = new Map();

    for (const game of games) {
        for (const row of game.pitching || []) {
            const key = row.playerId;
            const current = map.get(key) || {
                playerId: row.playerId,
                name: row.name,
                group: row.group,
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
            };

            current.g += 1;
            current.outs += row.outs || 0;
            current.h += row.h || 0;
            current.r += row.r || 0;
            current.er += row.er || 0;
            current.bb += row.bb || 0;
            current.hbp += row.hbp || 0;
            current.so += row.so || 0;
            current.win += row.win || 0;
            current.loss += row.loss || 0;
            current.save += row.save || 0;

            if (!current.group && row.group) {
                current.group = row.group;
            }

            map.set(key, current);
        }
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
        .sort((a, b) => b.outs - a.outs);
}

function buildTeamTotal(games, battingTotal) {
    const playerIds = new Set(battingTotal.map((row) => row.playerId));
    const sortedGames = [...games].sort((a, b) => a.gameDate.localeCompare(b.gameDate));

    const totalHits = battingTotal.reduce((sum, row) => sum + row.h, 0);
    const totalRuns = battingTotal.reduce((sum, row) => sum + row.r, 0);

    return {
        totalGames: games.length,
        totalPlayers: playerIds.size,
        totalHits,
        totalRuns,
        lastGameDate: sortedGames.at(-1)?.gameDate ?? null,
        recentGames: sortedGames.slice(-5).map((game) => ({
            gameId: game.gameId,
            gameDate: game.gameDate,
            opponent: game.opponent,
            score: game.score,
            group: game.group,
        })),
    };
}

function buildPlayersTotal(battingTotal, pitchingTotal) {
    const map = new Map();
    const players = readJson(path.join(META_DIR, 'players.json'), []);

    for (const player of players) {
        map.set(player.playerId, {
            playerId: player.playerId,
            name: player.name,
            group: player.group,
            backNumber: player.backNumber,
            position: player.position,
            image: player.image,
            batting: null,
            pitching: null,
        });
    }

    for (const row of battingTotal) {
        const current = map.get(row.playerId) || {
            playerId: row.playerId,
            name: row.name,
            group: row.group,
            batting: null,
            pitching: null,
        };
        current.batting = row;
        map.set(row.playerId, current);
    }

    for (const row of pitchingTotal) {
        const current = map.get(row.playerId) || {
            playerId: row.playerId,
            name: row.name,
            group: row.group,
            batting: null,
            pitching: null,
        };
        current.pitching = row;
        map.set(row.playerId, current);
    }

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

function buildYearlyRecords(games) {
    const yearMap = new Map();

    for (const game of games) {
        const year = game.year;
        const current = yearMap.get(year) || { year, games: 0, hits: 0, runs: 0 };
        current.games += 1;
        current.hits += (game.batting || []).reduce((sum, row) => sum + (row.h || 0), 0);
        current.runs += (game.batting || []).reduce((sum, row) => sum + (row.r || 0), 0);
        yearMap.set(year, current);
    }

    return [...yearMap.values()].sort((a, b) => b.year - a.year);
}

function buildMonthlyRecords(games) {
    const monthMap = new Map();

    for (const game of games) {
        const key = `${game.year}-${String(game.month).padStart(2, '0')}`;
        const current = monthMap.get(key) || {
            year: game.year,
            month: game.month,
            games: 0,
            hits: 0,
            runs: 0,
            gameIds: [],
        };

        current.games += 1;
        current.gameIds.push(game.gameId);
        current.hits += (game.batting || []).reduce((sum, row) => sum + (row.h || 0), 0);
        current.runs += (game.batting || []).reduce((sum, row) => sum + (row.r || 0), 0);
        monthMap.set(key, current);
    }

    return [...monthMap.values()]
        .map(({ gameIds, ...rest }) => rest)
        .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
}

function buildGroupRecords(games) {
    const groups = ['A', 'D'];
    const result = {};

    for (const group of groups) {
        const groupGames = games.filter((game) => game.group === group);
        const battingRows = groupGames.flatMap((game) => game.batting || []);
        const hits = battingRows.reduce((sum, row) => sum + (row.h || 0), 0);
        const runs = battingRows.reduce((sum, row) => sum + (row.r || 0), 0);
        const ab = battingRows.reduce((sum, row) => sum + (row.ab || 0), 0);
        const teamAvg = ab > 0 ? formatAvg(hits / ab) : '.000';

        const playerMap = new Map();
        for (const row of battingRows) {
            const current = playerMap.get(row.playerId) || {
                playerId: row.playerId,
                name: row.name,
                group: row.group,
                g: 0,
                ab: 0,
                h: 0,
                rbi: 0,
                hr: 0,
            };

            current.g += 1;
            current.ab += row.ab || 0;
            current.h += row.h || 0;
            current.rbi += row.rbi || 0;
            current.hr += row.hr || 0;
            playerMap.set(row.playerId, current);
        }

        const battingRanking = [...playerMap.values()]
            .map((stats) => ({
                ...stats,
                avg: formatAvg(stats.ab > 0 ? stats.h / stats.ab : 0),
            }))
            .sort((a, b) => b.h - a.h)
            .slice(0, 10);

        result[group] = {
            games: groupGames.length,
            hits,
            runs,
            teamAvg,
            battingRanking,
        };
    }

    return result;
}

export function buildAllRecords() {
    ensureDir(SUMMARY_DIR);

    const games = loadAllGames();

    if (!games.length) {
        console.log('[INFO] games JSON 파일이 없습니다. summary는 빈 값으로 생성합니다.');
    }

    const battingTotal = aggregateBatting(games);
    const pitchingTotal = aggregatePitching(games);
    const teamTotal = buildTeamTotal(games, battingTotal);
    const playersTotal = buildPlayersTotal(battingTotal, pitchingTotal);
    const yearlyRecords = buildYearlyRecords(games);
    const monthlyRecords = buildMonthlyRecords(games);
    const groupRecords = buildGroupRecords(games);

    writeJson(path.join(SUMMARY_DIR, 'batting-total.json'), battingTotal);
    writeJson(path.join(SUMMARY_DIR, 'pitching-total.json'), pitchingTotal);
    writeJson(path.join(SUMMARY_DIR, 'team-total.json'), teamTotal);
    writeJson(path.join(SUMMARY_DIR, 'players-total.json'), playersTotal);
    writeJson(path.join(SUMMARY_DIR, 'yearly-records.json'), yearlyRecords);
    writeJson(path.join(SUMMARY_DIR, 'monthly-records.json'), monthlyRecords);
    writeJson(path.join(SUMMARY_DIR, 'group-records.json'), groupRecords);

    return {
        games: games.length,
        battingPlayers: battingTotal.length,
        pitchingPlayers: pitchingTotal.length,
    };
}

function main() {
    console.log('=== build-records ===');
    const result = buildAllRecords();
    console.log(`완료: ${result.games}경기, 타자 ${result.battingPlayers}명, 투수 ${result.pitchingPlayers}명`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}
