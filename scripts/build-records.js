import path from 'path';
import { pathToFileURL } from 'url';
import {
    GAMES_DIR,
    SUMMARY_DIR,
    META_DIR,
    MANUAL_DIR,
    GENERATED_DIR,
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

const YOUTUBE_CHANNEL_URL =
    'https://www.youtube.com/@%EB%8B%A4%EC%9C%97%EC%95%BC%EA%B5%AC%EC%84%A0%EA%B5%90%EB%8B%A8';
const YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=';
const YOUTUBE_THUMBNAIL_URL = 'https://i.ytimg.com/vi/';
const RECORD_GROUPS = ['A', 'D'];

function loadAllGames() {
    const files = listFiles(GAMES_DIR, '.json');
    return files.map((filename) => readJson(path.join(GAMES_DIR, filename))).filter(Boolean);
}

function loadYoutubeLinks() {
    return readJson(path.join(MANUAL_DIR, 'youtube-links.json'), {});
}

function normalizeYoutubeLink(link) {
    if (!link) return null;

    const source = typeof link === 'string' ? { videoCode: link } : link;
    const videoCode = source.videoCode || source.youtubeCode || source.code || '';
    const youtubeUrl = source.youtubeUrl || (videoCode ? `${YOUTUBE_WATCH_URL}${videoCode}` : '');
    const thumbnail = source.thumbnail || (videoCode ? `${YOUTUBE_THUMBNAIL_URL}${videoCode}/hq720.jpg` : '');

    if (!youtubeUrl) return null;

    return {
        ...source,
        ...(videoCode ? { videoCode } : {}),
        youtubeUrl,
        thumbnail,
    };
}

function mergeYoutubeLinks(games, youtubeLinks) {
    return games.map((game) => ({
        ...game,
        youtube: normalizeYoutubeLink(youtubeLinks[game.gameId]),
    }));
}

function aggregateBatting(games) {
    const map = new Map();

    for (const game of games) {
        for (const row of game.batting || []) {
            const key = `${row.playerId}:${row.group || ''}`;
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
            const key = `${row.playerId}:${row.group || ''}`;
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

function buildPeriodGroupRecords(games) {
    return Object.fromEntries(
        RECORD_GROUPS.map((group) => {
            const groupGames = games.filter((game) => game.group === group);
            const battingRows = groupGames.flatMap((game) => game.batting || []);
            const pitchingRows = groupGames.flatMap((game) => game.pitching || []);

            return [
                group,
                {
                    group,
                    games: groupGames.length,
                    hits: battingRows.reduce((sum, row) => sum + (row.h || 0), 0),
                    runs: battingRows.reduce((sum, row) => sum + (row.r || 0), 0),
                    batting: aggregateBatting([{ batting: battingRows }]),
                    pitching: aggregatePitching([{ pitching: pitchingRows }]),
                },
            ];
        }),
    );
}

function buildYearlyRecords(games) {
    const yearMap = new Map();

    for (const game of games) {
        const year = game.year;
        const current = yearMap.get(year) || { year, games: 0, hits: 0, runs: 0, sourceGames: [], batting: [], pitching: [] };
        current.games += 1;
        current.sourceGames.push(game);
        current.hits += (game.batting || []).reduce((sum, row) => sum + (row.h || 0), 0);
        current.runs += (game.batting || []).reduce((sum, row) => sum + (row.r || 0), 0);
        current.batting.push(...(game.batting || []));
        current.pitching.push(...(game.pitching || []));
        yearMap.set(year, current);
    }

    return [...yearMap.values()]
        .map((item) => ({
            year: item.year,
            games: item.games,
            hits: item.hits,
            runs: item.runs,
            batting: aggregateBatting([{ batting: item.batting }]),
            pitching: aggregatePitching([{ pitching: item.pitching }]),
            groups: buildPeriodGroupRecords(item.sourceGames),
        }))
        .sort((a, b) => b.year - a.year);
}

function buildMonthlyRecords(games) {
    const monthMap = new Map();

    for (const game of games) {
        const key = `${game.year}-${String(game.month).padStart(2, '0')}`;
        const current = monthMap.get(key) || {
            key,
            year: game.year,
            month: game.month,
            games: 0,
            hits: 0,
            runs: 0,
            gameIds: [],
            sourceGames: [],
            batting: [],
            pitching: [],
        };

        current.games += 1;
        current.gameIds.push(game.gameId);
        current.sourceGames.push(game);
        current.hits += (game.batting || []).reduce((sum, row) => sum + (row.h || 0), 0);
        current.runs += (game.batting || []).reduce((sum, row) => sum + (row.r || 0), 0);
        current.batting.push(...(game.batting || []));
        current.pitching.push(...(game.pitching || []));
        monthMap.set(key, current);
    }

    return [...monthMap.values()]
        .map((item) => ({
            key: item.key,
            year: item.year,
            month: item.month,
            games: item.games,
            hits: item.hits,
            runs: item.runs,
            batting: aggregateBatting([{ batting: item.batting }]),
            pitching: aggregatePitching([{ pitching: item.pitching }]),
            groups: buildPeriodGroupRecords(item.sourceGames),
        }))
        .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
}

function getMondayWeekKey(dateText) {
    const date = new Date(`${dateText}T00:00:00+09:00`);
    const day = date.getDay() || 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - day + 1);
    const monthStart = new Date(monday.getFullYear(), monday.getMonth(), 1);
    const monthStartDay = monthStart.getDay() || 7;
    const firstMonday = new Date(monthStart);
    firstMonday.setDate(monthStart.getDate() + (monthStartDay === 1 ? 0 : 8 - monthStartDay));
    const week = monday < firstMonday ? 1 : Math.floor((monday - firstMonday) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-W${week}`;
}

function battingScore(row) {
    return (row.h || 0) * 4 + (row.rbi || 0) * 3 + (row.r || 0) * 2 + (row.sb || 0) * 1.5 + (row.hr || 0) * 5;
}

function pitchingScore(row) {
    return (row.outs || 0) * 1.5 + (row.so || 0) * 2 + (row.win || 0) * 8 + (row.save || 0) * 5 - (row.er || 0) * 2;
}

function pickTop(rows, scoreFn, limit = 3) {
    return [...rows]
        .map((row) => ({ ...row, mvpScore: Number(scoreFn(row).toFixed(1)) }))
        .sort((a, b) => b.mvpScore - a.mvpScore)
        .slice(0, limit);
}

function buildMvpByPeriod(games, getKey, label) {
    const map = new Map();

    for (const game of games) {
        const periodKey = getKey(game);
        const group = game.group || '';
        const key = `${periodKey}:${group || 'unknown'}`;
        const current = map.get(key) || { key, periodKey, group, games: [], batting: [], pitching: [] };
        current.games.push(game);
        current.batting.push(...(game.batting || []));
        current.pitching.push(...(game.pitching || []));
        map.set(key, current);
    }

    return [...map.values()]
        .sort((a, b) => b.key.localeCompare(a.key))
        .flatMap((period) => {
            const battingLeaders = pickTop(aggregateBatting([{ batting: period.batting }]), battingScore, 3);
            const pitchingLeaders = pickTop(aggregatePitching([{ pitching: period.pitching }]), pitchingScore, 3);
            const result = [];
            const groupLabel = period.group ? `${period.group}조 ` : '';

            battingLeaders.forEach((batting, index) => {
                result.push({
                    id: `${period.periodKey}-${period.group || 'unknown'}-batting-${index + 1}`,
                    key: period.periodKey,
                    group: period.group,
                    rank: index + 1,
                    type: 'batting',
                    title: `${period.periodKey} ${groupLabel}${label} 타자 MVP ${index + 1}위`,
                    name: batting.name,
                    summary: `${period.games.length}경기 ${batting.h}안타 ${batting.rbi}타점 ${batting.r}득점`,
                    stats: { avg: batting.avg, h: batting.h, rbi: batting.rbi, hr: batting.hr, score: batting.mvpScore },
                });
            });

            pitchingLeaders.forEach((pitching, index) => {
                result.push({
                    id: `${period.periodKey}-${period.group || 'unknown'}-pitching-${index + 1}`,
                    key: period.periodKey,
                    group: period.group,
                    rank: index + 1,
                    type: 'pitching',
                    title: `${period.periodKey} ${groupLabel}${label} 투수 MVP ${index + 1}위`,
                    name: pitching.name,
                    summary: `${period.games.length}경기 ${pitching.ip}이닝 ${pitching.so}탈삼진`,
                    stats: { ip: pitching.ip, era: pitching.era, so: pitching.so, win: pitching.win, score: pitching.mvpScore },
                });
            });

            return result;
        });
}

function buildMonthlyMvp(games) {
    return buildMvpByPeriod(games, (game) => `${game.year}-${String(game.month).padStart(2, '0')}`, '월간');
}

function buildWeeklyMvp(games) {
    return buildMvpByPeriod(games, (game) => getMondayWeekKey(game.gameDate), '주간');
}

function formatOpponent(opponent = '') {
    return String(opponent).replace(/-/g, ' ');
}

function getOpponentName(game) {
    return game.opponentSummary?.teamName || formatOpponent(game.opponent);
}

function buildAutoNews(games) {
    return [...games]
        .sort((a, b) => b.gameDate.localeCompare(a.gameDate))
        .map((game) => {
            const summary = game.summary || {};
            const highlightText = (game.highlights || [])
                .slice(0, 2)
                .map((item) => `${item.type} ${item.text}`)
                .join(', ');
            const statText = `${summary.hits ?? 0}안타 ${summary.homeRuns ?? 0}홈런 ${summary.steals ?? 0}도루`;

            return {
                id: `game-${game.gameId}`,
                slug: `game-${game.gameId}`,
                source: 'game-record',
                autoGenerated: true,
                category: '경기 기록',
                title: `다윗 야구 선교단, ${getOpponentName(game)}전 경기 기록 업데이트`,
                date: game.gameDate,
                summary: `다윗 야구 선교단은 ${statText}를 기록했습니다.${highlightText ? ` 주요 기록: ${highlightText}.` : ''}`,
                content: `<p>다윗 야구 선교단은 ${getOpponentName(game)}전에서 ${statText}를 기록했습니다.</p>${highlightText ? `<p>주요 기록은 ${highlightText}입니다.</p>` : ''}<p><a href="/games/${game.gameId}">경기 상세 기록 보기</a></p>`,
                link: `/games/${game.gameId}`,
                gameId: game.gameId,
                youtube: game.youtube,
            };
        });
}

function buildVideos(games) {
    const mapped = games
        .filter((game) => game.youtube)
        .map((game) => ({
            id: `game-${game.gameId}`,
            gameId: game.gameId,
            title: game.youtube.title || `${game.gameDate} ${getOpponentName(game)}전 경기 영상`,
            youtubeUrl: game.youtube.youtubeUrl,
            embedUrl: '',
            thumbnail: game.youtube.thumbnail || '',
            category: '경기',
            date: game.youtube.publishedAt || game.gameDate,
        }));

    return mapped.length
        ? mapped
        : [
              {
                  id: 'youtube-channel',
                  title: '다윗 야구 선교단 YouTube 채널',
                  youtubeUrl: YOUTUBE_CHANNEL_URL,
                  embedUrl: '',
                  thumbnail: '',
                  category: '채널',
                  date: '',
              },
          ];
}

function buildGroupRecords(games) {
    const result = {};

    for (const group of RECORD_GROUPS) {
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
    ensureDir(GENERATED_DIR);

    const youtubeLinks = loadYoutubeLinks();
    const games = mergeYoutubeLinks(loadAllGames(), youtubeLinks);

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
    const monthlyMvp = buildMonthlyMvp(games);
    const weeklyMvp = buildWeeklyMvp(games);
    const news = buildAutoNews(games);
    const videos = buildVideos(games);

    for (const game of games) {
        writeJson(path.join(GAMES_DIR, `${game.gameId}.json`), game);
    }

    writeJson(path.join(SUMMARY_DIR, 'batting-total.json'), battingTotal);
    writeJson(path.join(SUMMARY_DIR, 'pitching-total.json'), pitchingTotal);
    writeJson(path.join(SUMMARY_DIR, 'team-total.json'), teamTotal);
    writeJson(path.join(SUMMARY_DIR, 'players-total.json'), playersTotal);
    writeJson(path.join(SUMMARY_DIR, 'yearly-records.json'), yearlyRecords);
    writeJson(path.join(SUMMARY_DIR, 'monthly-records.json'), monthlyRecords);
    writeJson(path.join(SUMMARY_DIR, 'group-records.json'), groupRecords);
    writeJson(path.join(SUMMARY_DIR, 'mvp-monthly.json'), monthlyMvp);
    writeJson(path.join(SUMMARY_DIR, 'mvp-weekly.json'), weeklyMvp);
    writeJson(path.join(GENERATED_DIR, 'games.json'), games);
    writeJson(path.join(GENERATED_DIR, 'season-stats.json'), {
        batting: battingTotal,
        pitching: pitchingTotal,
        team: teamTotal,
    });
    writeJson(path.join(GENERATED_DIR, 'monthly-stats.json'), monthlyRecords);
    writeJson(path.join(GENERATED_DIR, 'monthly-mvp.json'), monthlyMvp);
    writeJson(path.join(GENERATED_DIR, 'weekly-mvp.json'), weeklyMvp);
    writeJson(path.join(GENERATED_DIR, 'news.json'), news);
    writeJson(path.join(GENERATED_DIR, 'videos.json'), videos);

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
