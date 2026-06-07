/** @typedef {'win'|'loss'|'tie'|'cold-win'|'cold-loss'|'forfeit-win'} GameResultKind */

/** 몰수승 공식 점수 (우리팀 : 상대팀) */
export const FORFEIT_WIN_SCORE = { our: 0, opponent: 7 };

const EMPTY_SUMMARY = {
    hits: 0,
    homeRuns: 0,
    steals: 0,
    strikeouts: 0,
    errors: 0,
    walksAndHbp: 0,
};

export function isForfeitResult(result) {
    return result === 'forfeit-win';
}

export function shouldExcludeFromRecords(game) {
    return Boolean(game?.excludeFromRecords) || isForfeitResult(game?.result);
}

export function applyForfeitPresentation(game) {
    if (!isForfeitResult(game?.result)) {
        return game;
    }

    return {
        ...game,
        score: { ...FORFEIT_WIN_SCORE },
        excludeFromRecords: true,
        batting: [],
        pitching: [],
        summary: { ...EMPTY_SUMMARY },
        highlights: [],
    };
}

export function filterRecordableGames(games) {
    return games.filter((game) => !shouldExcludeFromRecords(game));
}
