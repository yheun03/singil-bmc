import path from 'path';
import { MANUAL_DIR, readJson } from './records-utils.js';
import { normalizeTeamText } from './records-utils.js';

export const SEASON_TEAMS_FILENAME = 'season-teams.json';

export const DEFAULT_SEASON_TEAMS_CONFIG = {
    fallback: {
        groups: [
            { id: 'A', label: 'A조', teamNames: ['Davids 야구 선교단'] },
            { id: 'D', label: 'D조', teamNames: ['다윗 야구 선교단'] },
        ],
    },
    seasons: {
        2026: {
            groups: [
                { id: 'A', label: 'A조', teamNames: ['Davids 야구 선교단'] },
                { id: 'D', label: 'D조', teamNames: ['다윗 야구 선교단'] },
            ],
        },
        2025: {
            groups: [
                { id: 'D', label: 'D조', teamNames: ['Davids 야구 선교단'] },
                { id: 'E', label: 'E조', teamNames: ['다윗 야구 선교단'] },
            ],
        },
    },
};

export function loadSeasonTeamsConfig() {
    const filePath = path.join(MANUAL_DIR, SEASON_TEAMS_FILENAME);
    const config = readJson(filePath, null);

    if (!config) {
        return structuredClone(DEFAULT_SEASON_TEAMS_CONFIG);
    }

    return config;
}

function normalizeSeasonGroups(season) {
    if (!season?.groups?.length) {
        return [];
    }

    return season.groups
        .filter((group) => group?.id)
        .map((group) => ({
            id: String(group.id).trim(),
            label: group.label?.trim() || `${group.id}조`,
            teamNames: (group.teamNames || []).map((name) => normalizeTeamText(name)).filter(Boolean),
        }));
}

export function getSeasonGroups(config, year) {
    const key = String(year ?? '');
    const season = config?.seasons?.[key];
    const groups = normalizeSeasonGroups(season);

    if (groups.length) {
        return groups;
    }

    return normalizeSeasonGroups(config?.fallback);
}

function buildTeamMappings(groups) {
    const mappings = [];

    for (const group of groups) {
        for (const teamName of group.teamNames) {
            mappings.push({
                groupId: group.id,
                teamName,
            });
        }
    }

    return mappings.sort((a, b) => b.teamName.length - a.teamName.length);
}

/**
 * @param {ReturnType<typeof loadSeasonTeamsConfig>} config
 * @param {number|string} year
 */
export function createSeasonTeamsResolver(config, year) {
    const groups = getSeasonGroups(config, year);
    const mappings = buildTeamMappings(groups);

    return {
        year: Number(year) || null,
        groups,
        groupIds: groups.map((group) => group.id),
        mappings,
        isOurTeamName(teamName = '') {
            const normalized = normalizeTeamText(teamName);
            return mappings.some((entry) => normalized.includes(entry.teamName));
        },
        getGroupFromTeamName(teamName = '') {
            const normalized = normalizeTeamText(teamName);

            for (const entry of mappings) {
                if (normalized.includes(entry.teamName)) {
                    return entry.groupId;
                }
            }

            return '';
        },
        getOurTeamNames() {
            return mappings.map((entry) => entry.teamName);
        },
    };
}

export function getAllGroupIds(config) {
    const ids = new Set();

    for (const season of Object.values(config?.seasons || {})) {
        for (const group of normalizeSeasonGroups(season)) {
            ids.add(group.id);
        }
    }

    for (const group of normalizeSeasonGroups(config?.fallback)) {
        ids.add(group.id);
    }

    return [...ids].sort((a, b) => a.localeCompare(b, 'ko'));
}

export function collectRecordGroups(games, config) {
    const ids = new Set(getAllGroupIds(config));

    for (const game of games) {
        if (game?.group) {
            ids.add(game.group);
        }
    }

    return [...ids].sort((a, b) => a.localeCompare(b, 'ko'));
}
