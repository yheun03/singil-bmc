export type Player = {
    playerId: string;
    name: string;
    gameoneName?: string;
    group: string;
    backNumber?: number;
    position?: string;
    hand?: string;
    image?: string;
    gameoneGroupCode?: string;
    gameoneClubId?: string;
    gameoneProfileUrl?: string;
};

export type PlayerMembership = {
    group: string;
    playerId: string;
    position?: string;
    backNumber?: number;
    gameoneProfileUrl?: string;
    gameoneClubId?: string;
};

/** 게임원 A·D조 중복 등록을 하나의 선수 카드로 묶은 명단 */
export type RosterPlayer = {
    rosterId: string;
    name: string;
    gameoneName?: string;
    groups: string[];
    memberships: PlayerMembership[];
    isDualGroup: boolean;
    hand?: string;
    image?: string;
    gameoneGroupCode?: string;
    /** A조 프로필 우선(동일 인물 단일 프로필) */
    gameoneProfileUrl?: string;
};

/** 정렬·표시용 백넘버 (A조 우선) */
export function getRosterSortBackNumber(player: RosterPlayer): number | null {
    const aMembership = player.memberships.find((membership) => membership.group === 'A');
    const dMembership = player.memberships.find((membership) => membership.group === 'D');

    if (aMembership?.backNumber !== undefined) {
        return aMembership.backNumber;
    }

    if (dMembership?.backNumber !== undefined) {
        return dMembership.backNumber;
    }

    const fallback = player.memberships.find((membership) => membership.backNumber !== undefined);
    return fallback?.backNumber ?? null;
}

function compareRosterByBackNumber(a: RosterPlayer, b: RosterPlayer) {
    const aNumber = getRosterSortBackNumber(a);
    const bNumber = getRosterSortBackNumber(b);

    if (aNumber === null && bNumber === null) {
        return a.name.localeCompare(b.name, 'ko');
    }

    if (aNumber === null) return 1;
    if (bNumber === null) return -1;
    if (aNumber !== bNumber) return aNumber - bNumber;

    return a.name.localeCompare(b.name, 'ko');
}

export function isPitcher(position?: string) {
    if (!position) return false;
    return /\bP\b/.test(position) || position.startsWith('P/') || position.includes('투수');
}

export function isBatter(position?: string) {
    if (!position) return true;
    if (position === 'MGR') return false;
    return !isPitcher(position);
}

export function formatPositionLabel(position?: string) {
    if (!position) return '-';
    if (position === 'MGR') return '감독';
    if (position === '미지정') return '미지정';
    return position;
}

function playerMergeKey(player: Player) {
    const code = player.gameoneGroupCode?.trim().toUpperCase();
    if (code) return `code:${code}`;
    return `name:${player.name.trim()}`;
}

function isDefaultGameoneImage(image?: string) {
    if (!image) return true;
    return /member_default/i.test(image);
}

function pickBestImage(entries: Player[]) {
    const custom = entries.find((entry) => entry.image && !isDefaultGameoneImage(entry.image));
    return custom?.image ?? entries.find((entry) => entry.image)?.image;
}

function pickProfileUrl(entries: Player[]) {
    const aEntry = entries.find((entry) => entry.group === 'A' && entry.gameoneProfileUrl);
    if (aEntry?.gameoneProfileUrl) return aEntry.gameoneProfileUrl;

    const dEntry = entries.find((entry) => entry.group === 'D' && entry.gameoneProfileUrl);
    if (dEntry?.gameoneProfileUrl) return dEntry.gameoneProfileUrl;

    return entries.find((entry) => entry.gameoneProfileUrl)?.gameoneProfileUrl;
}

export function mergePlayers(raw: Player[]): RosterPlayer[] {
    const grouped = new Map<string, Player[]>();

    for (const player of raw) {
        const key = playerMergeKey(player);
        const bucket = grouped.get(key) ?? [];
        bucket.push(player);
        grouped.set(key, bucket);
    }

    return [...grouped.values()]
        .map((entries) => {
            const memberships = [...entries]
                .sort((a, b) => a.group.localeCompare(b.group))
                .map((entry) => ({
                    group: entry.group,
                    playerId: entry.playerId,
                    position: entry.position,
                    backNumber: entry.backNumber,
                    gameoneProfileUrl: entry.gameoneProfileUrl,
                    gameoneClubId: entry.gameoneClubId,
                }));

            const groups = [...new Set(memberships.map((membership) => membership.group))].sort();
            const primary = entries[0];

            return {
                rosterId: playerMergeKey(primary),
                name: primary.name,
                gameoneName: primary.gameoneName,
                groups,
                memberships,
                isDualGroup: groups.length > 1,
                hand: entries.find((entry) => entry.hand)?.hand,
                image: pickBestImage(entries),
                gameoneGroupCode: primary.gameoneGroupCode,
                gameoneProfileUrl: pickProfileUrl(entries),
            };
        })
        .sort(compareRosterByBackNumber);
}

export function rosterIsPitcher(player: RosterPlayer) {
    return player.memberships.some((membership) => isPitcher(membership.position));
}

export function rosterIsBatter(player: RosterPlayer) {
    return player.memberships.some((membership) => isBatter(membership.position));
}

export function formatRosterGroups(player: RosterPlayer) {
    return player.groups.map((group) => `${group}조`).join(' · ');
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function getRosterDisplayPosition(player: RosterPlayer): string {
    const aMembership = player.memberships.find((membership) => membership.group === 'A');
    const dMembership = player.memberships.find((membership) => membership.group === 'D');

    if (aMembership?.position !== undefined) {
        return formatPositionLabel(aMembership.position);
    }

    if (dMembership?.position !== undefined) {
        return formatPositionLabel(dMembership.position);
    }

    const fallback = player.memberships.find((membership) => membership.position !== undefined);
    return formatPositionLabel(fallback?.position);
}

/** A·D조 포지션이 다를 때만 D조 포지션 반환 (HTML 주석용) */
export function getRosterDPositionComment(player: RosterPlayer): string | null {
    const aMembership = player.memberships.find((membership) => membership.group === 'A');
    const dMembership = player.memberships.find((membership) => membership.group === 'D');

    if (!aMembership?.position || !dMembership?.position) {
        return null;
    }

    const aPosition = formatPositionLabel(aMembership.position);
    const dPosition = formatPositionLabel(dMembership.position);

    if (aPosition === dPosition) {
        return null;
    }

    return dPosition;
}

export function rosterPositionMarkup(player: RosterPlayer): string {
    const display = escapeHtml(getRosterDisplayPosition(player));
    const dPosition = getRosterDPositionComment(player);

    if (!dPosition) {
        return display;
    }

    return `${display}<!-- D조 포지션: ${escapeHtml(dPosition)} -->`;
}

/** @deprecated rosterPositionMarkup 사용 */
export function formatRosterPosition(player: RosterPlayer) {
    return getRosterDisplayPosition(player);
}

export function getRosterDisplayBackNumber(player: RosterPlayer): string | null {
    const backNumber = getRosterSortBackNumber(player);
    return backNumber === null ? null : String(backNumber);
}

/** A·D조 백넘버가 다를 때만 D조 번호 반환 (HTML 주석용) */
export function getRosterDBackNumberComment(player: RosterPlayer): string | null {
    const aMembership = player.memberships.find((membership) => membership.group === 'A');
    const dMembership = player.memberships.find((membership) => membership.group === 'D');

    if (aMembership?.backNumber === undefined || dMembership?.backNumber === undefined) {
        return null;
    }

    if (aMembership.backNumber === dMembership.backNumber) {
        return null;
    }

    return String(dMembership.backNumber);
}

export function rosterBackNumberMarkup(player: RosterPlayer): string | null {
    const display = getRosterDisplayBackNumber(player);
    if (!display) return null;

    const safeDisplay = escapeHtml(display);
    const dBackNumber = getRosterDBackNumberComment(player);

    if (!dBackNumber) {
        return `<span class="bmc-roster-card__number">${safeDisplay}</span>`;
    }

    return `<span class="bmc-roster-card__number">${safeDisplay}</span><!-- D조 백넘버: ${escapeHtml(dBackNumber)} -->`;
}

/** @deprecated rosterBackNumberMarkup 사용 */
export function formatRosterBackNumber(player: RosterPlayer) {
    return getRosterDisplayBackNumber(player);
}

export function resolvePlayerImageUrl(image: string | undefined, getDataPath: (relativePath: string) => string) {
    if (!image?.trim()) {
        return playerPlaceholderPath(getDataPath);
    }

    const trimmed = image.trim();

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    const normalized = trimmed.replace(/^\/data\//, '').replace(/^data\//, '');
    return getDataPath(normalized);
}

export function playerPlaceholderPath(getDataPath: (relativePath: string) => string) {
    return getDataPath('images/players/placeholder.jpg');
}

export function usePlayerImage() {
    const { getDataPath } = useBasePath();

    const placeholderImageUrl = computed(() => playerPlaceholderPath(getDataPath));

    function playerImageUrl(image?: string) {
        return resolvePlayerImageUrl(image, getDataPath);
    }

    function onPlayerImageError(event: Event) {
        const img = event.target as HTMLImageElement | null;
        if (!img) return;

        const fallback = placeholderImageUrl.value;
        if (img.src !== fallback) {
            img.src = fallback;
        }
    }

    return { playerImageUrl, placeholderImageUrl, onPlayerImageError };
}

export function usePlayers() {
    const { data, pending, error, reload } = useSiteData<Player[]>('meta/players.json');

    const roster = computed(() => mergePlayers(data.value ?? []));
    const pitchers = computed(() => roster.value.filter((player) => rosterIsPitcher(player)));
    const batters = computed(() => roster.value.filter((player) => rosterIsBatter(player)));
    const dualGroupCount = computed(() => roster.value.filter((player) => player.isDualGroup).length);

    const rosterSummary = computed(() => {
        const total = roster.value.length;
        const dual = dualGroupCount.value;

        if (!total) return '';
        if (!dual) return `등록 ${total}명`;
        return `등록 ${total}명`;
        // return `등록 ${total}명 · A·D조 중복 등록 ${dual}명`;
    });

    return {
        roster,
        pitchers,
        batters,
        dualGroupCount,
        rosterSummary,
        pending,
        error,
        reload,
    };
}
