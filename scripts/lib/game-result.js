/** @typedef {'win'|'loss'|'tie'|'cold-win'|'cold-loss'|'forfeit-win'|'forfeit-loss'} GameResultKind */

/** 몰수 경기 표기 점수 (우리팀 : 상대팀) */
export const FORFEIT_WIN_SCORE = { our: 7, opponent: 0 };
export const FORFEIT_LOSS_SCORE = { our: 0, opponent: 7 };

const EMPTY_SUMMARY = {
    hits: 0,
    homeRuns: 0,
    steals: 0,
    strikeouts: 0,
    errors: 0,
    walksAndHbp: 0,
};

export function isForfeitResult(result) {
    return result === 'forfeit-win' || result === 'forfeit-loss';
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
        score: { ...(game.result === 'forfeit-win' ? FORFEIT_WIN_SCORE : FORFEIT_LOSS_SCORE) },
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
