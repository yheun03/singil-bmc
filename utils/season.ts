export type GameWithSeason = {
    year?: number;
    seasonYear?: number;
    gameDate?: string;
};

/** 시즌 연도 (없으면 달력 연도) */
export function getSeasonYear(game: GameWithSeason | null | undefined): number | null {
    if (!game) return null;
    return game.seasonYear ?? game.year ?? null;
}
