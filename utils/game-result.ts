export type GameScore = { our?: number; opponent?: number };

export type GameResultKind = 'win' | 'loss' | 'tie' | 'cold-win' | 'cold-loss';

export type GameResultInput = {
    score?: GameScore | null;
    /** JSON에 수동 지정 시 우선 (예: "cold-win") */
    result?: GameResultKind | null;
    /** 경기 이닝 수가 있으면 콜드 판정에 반영 */
    inningsPlayed?: number | null;
};

/** 아마추어 리그 일반 콜드 기준: 5회 이상·10점차 (이닝 미기록 시 점수차만으로 추정) */
const COLD_RUN_DIFF = 10;
const COLD_MAX_INNINGS = 7;

export const gameResultMeta: Record<
    GameResultKind,
    { abbr: string; label: string; longLabel: string; description: string }
> = {
    win: {
        abbr: 'W',
        label: '승',
        longLabel: '승리',
        description: '우리팀 승리',
    },
    loss: {
        abbr: 'L',
        label: '패',
        longLabel: '패배',
        description: '우리팀 패배',
    },
    'cold-win': {
        abbr: 'CW',
        label: '콜드승',
        longLabel: '콜드승',
        description: '10점차 이상 조기 종료 승리',
    },
    'cold-loss': {
        abbr: 'CL',
        label: '콜드패',
        longLabel: '콜드패',
        description: '10점차 이상 조기 종료 패배',
    },
    tie: {
        abbr: 'D',
        label: '무',
        longLabel: '무승부',
        description: '동점 종료',
    },
};

export function isColdGame(score: GameScore, inningsPlayed?: number | null): boolean {
    const our = score.our ?? 0;
    const opponent = score.opponent ?? 0;
    const diff = Math.abs(our - opponent);

    if (diff < COLD_RUN_DIFF) {
        return false;
    }

    if (inningsPlayed != null && inningsPlayed > COLD_MAX_INNINGS) {
        return false;
    }

    return true;
}

export function resolveGameResult(input: GameResultInput): GameResultKind {
    if (input.result) {
        return input.result;
    }

    const our = input.score?.our ?? 0;
    const opponent = input.score?.opponent ?? 0;

    if (our === opponent) {
        return 'tie';
    }

    const won = our > opponent;
    const cold = isColdGame({ our, opponent }, input.inningsPlayed);

    if (won) {
        return cold ? 'cold-win' : 'win';
    }

    return cold ? 'cold-loss' : 'loss';
}

export function summarizeSeasonResults(games: GameResultInput[]): Record<GameResultKind, number> {
    const counts: Record<GameResultKind, number> = {
        win: 0,
        loss: 0,
        tie: 0,
        'cold-win': 0,
        'cold-loss': 0,
    };

    for (const game of games) {
        counts[resolveGameResult(game)] += 1;
    }

    return counts;
}
