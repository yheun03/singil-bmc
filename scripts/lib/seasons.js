import path from 'path';
import { MANUAL_DIR, readJson } from './records-utils.js';

export const SEASONS_FILENAME = 'seasons.json';

/** @typedef {{ season: number, startDate: string }} SeasonBoundary */

export const DEFAULT_SEASONS_CONFIG = {
    _note: 'boundaries가 비어 있으면 경기일 달력 연도(1월 1일·신정 기준)를 시즌으로 사용합니다.',
    boundaries: [],
};

export function loadSeasonsConfig() {
    const filePath = path.join(MANUAL_DIR, SEASONS_FILENAME);
    const config = readJson(filePath, null);

    if (!config) {
        return structuredClone(DEFAULT_SEASONS_CONFIG);
    }

    return config;
}

function normalizeBoundaries(config) {
    return (config?.boundaries || [])
        .map((entry) => ({
            season: Number(entry.season),
            startDate: String(entry.startDate || '').trim(),
        }))
        .filter((entry) => Number.isFinite(entry.season) && entry.startDate)
        .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/**
 * 경기일(YYYY-MM-DD)과 시즌 개막일 기준으로 시즌 연도를 판정합니다.
 * boundaries는 startDate 내림차순으로 검사하며, gameDate >= startDate인 첫 시즌을 사용합니다.
 */
export function resolveSeasonYear(gameDate, seasonsConfig, gameOverrides = {}, gameId = '') {
    const override = gameId ? gameOverrides[gameId] : null;
    if (override?.seasonYear != null) {
        return Number(override.seasonYear);
    }

    const boundaries = normalizeBoundaries(seasonsConfig);
    for (const boundary of boundaries) {
        if (gameDate >= boundary.startDate) {
            return boundary.season;
        }
    }

    const [yearText] = String(gameDate).split('-');
    return parseInt(yearText, 10) || new Date().getFullYear();
}

/** 게임 객체에서 시즌 연도 (없으면 달력 연도) */
export function getSeasonYear(game) {
    return game?.seasonYear ?? game?.year ?? null;
}

export function applySeasonYear(game, seasonsConfig, gameOverrides = {}) {
    const seasonYear = resolveSeasonYear(game.gameDate, seasonsConfig, gameOverrides, game.gameId);

    return {
        ...game,
        seasonYear,
    };
}
