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

export function isPitcher(position?: string) {
    if (!position) return false;
    return /\bP\b/.test(position) || position.startsWith('P/') || position.includes('투수');
}

export function isBatter(position?: string) {
    if (!position) return true;
    if (position === 'MGR') return false;
    return !isPitcher(position);
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

    const players = computed(() => data.value ?? []);
    const pitchers = computed(() => players.value.filter((player) => isPitcher(player.position)));
    const batters = computed(() => players.value.filter((player) => isBatter(player.position)));

    return {
        players,
        pitchers,
        batters,
        pending,
        error,
        reload,
    };
}
