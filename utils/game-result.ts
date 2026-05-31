/** 몰수승 공식 점수 (우리팀 : 상대팀) */
export const FORFEIT_WIN_SCORE = { our: 0, opponent: 7 } as const;

export type GameScore = { our?: number; opponent?: number };

export type GameResultKind =
    | 'win'
    | 'loss'
    | 'tie'
    | 'cold-win'
    | 'cold-loss'
    | 'forfeit-win';

export type GameResultInput = {
    score?: GameScore | null;
    /** JSON·override 수동 지정 (예: "cold-win", "forfeit-win") */
    result?: GameResultKind | null;
    /** 경기 이닝 수가 있으면 콜드 판정에 반영 */
    inningsPlayed?: number | null;
    /** true면 타·투수·팀 누적 기록에서 제외 */
    excludeFromRecords?: boolean;
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
    'forfeit-win': {
        abbr: 'FW',
        label: '몰수승',
        longLabel: '몰수승',
        description: '상대팀 몰수패 승리. 타·투수 기록 미포함',
    },
    tie: {
        abbr: 'D',
        label: '무',
        longLabel: '무승부',
        description: '동점 종료',
    },
};

export function isForfeitResult(result?: GameResultKind | null): boolean {
    return result === 'forfeit-win';
}

export function shouldExcludeFromRecords(input: GameResultInput): boolean {
    return Boolean(input.excludeFromRecords) || isForfeitResult(input.result);
}

export function isWinResult(kind: GameResultKind): boolean {
    return kind === 'win' || kind === 'cold-win' || kind === 'forfeit-win';
}

export function isLossResult(kind: GameResultKind): boolean {
    return kind === 'loss' || kind === 'cold-loss';
}

export function resolveDisplayScore(input: GameResultInput): GameScore {
    if (input.result === 'forfeit-win') {
        return { ...FORFEIT_WIN_SCORE };
    }

    return {
        our: input.score?.our ?? 0,
        opponent: input.score?.opponent ?? 0,
    };
}

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

    const score = resolveDisplayScore(input);
    const our = score.our ?? 0;
    const opponent = score.opponent ?? 0;

    if (our === opponent) {
        return 'tie';
    }

    const won = our > opponent;
    const cold = isColdGame(score, input.inningsPlayed);

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
        'forfeit-win': 0,
    };

    for (const game of games) {
        counts[resolveGameResult(game)] += 1;
    }

    return counts;
}

export function formatDisplayScore(input: GameResultInput): string {
    const score = resolveDisplayScore(input);
    return `${score.our ?? 0} : ${score.opponent ?? 0}`;
}
