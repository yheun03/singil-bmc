export type SeasonGroupConfig = {
    id: string;
    label: string;
    teamNames: string[];
};

export type SeasonTeamsConfig = {
    fallback?: { groups: SeasonGroupConfig[] };
    seasons: Record<string, { groups: SeasonGroupConfig[] }>;
};

export function getSeasonGroupsForYear(config: SeasonTeamsConfig | null | undefined, year: number | string) {
    const key = String(year);
    const seasonGroups = config?.seasons?.[key]?.groups;
    if (seasonGroups?.length) {
        return seasonGroups;
    }

    return config?.fallback?.groups ?? [];
}

export function getAllConfiguredGroupIds(config: SeasonTeamsConfig | null | undefined): string[] {
    const ids = new Set<string>();

    for (const season of Object.values(config?.seasons ?? {})) {
        for (const group of season.groups ?? []) {
            if (group.id) ids.add(group.id);
        }
    }

    for (const group of config?.fallback?.groups ?? []) {
        if (group.id) ids.add(group.id);
    }

    return [...ids].sort((a, b) => a.localeCompare(b, 'ko'));
}

type TabItem = {
    id: string;
    title: string;
    bodyRenderer: () => null;
};

export function getGroupLabel(
    config: SeasonTeamsConfig | null | undefined,
    groupId: string,
    year?: number | string,
) {
    const candidates = year
        ? getSeasonGroupsForYear(config, year)
        : [
              ...(config?.fallback?.groups ?? []),
              ...Object.values(config?.seasons ?? {}).flatMap((season) => season.groups ?? []),
          ];

    return candidates.find((group) => group.id === groupId)?.label ?? `${groupId}조`;
}

export function buildAllGroupTabItems(
    config: SeasonTeamsConfig | null | undefined,
    options?: { includeAll?: boolean },
): TabItem[] {
    const includeAll = options?.includeAll ?? true;
    const tabs: TabItem[] = [];

    if (includeAll) {
        tabs.push({ id: 'all', title: '전체', bodyRenderer: () => null });
    }

    for (const id of getAllConfiguredGroupIds(config)) {
        tabs.push({
            id,
            title: getGroupLabel(config, id),
            bodyRenderer: () => null,
        });
    }

    return tabs;
}

export function buildRecordGroupTabItems(
    config: SeasonTeamsConfig | null | undefined,
    year: number | string,
    options?: { includeAll?: boolean },
): TabItem[] {
    const includeAll = options?.includeAll ?? true;
    const groups = getSeasonGroupsForYear(config, year);
    const tabs: TabItem[] = [];

    if (includeAll) {
        tabs.push({ id: 'all', title: '전체', bodyRenderer: () => null });
    }

    for (const group of groups) {
        tabs.push({
            id: group.id,
            title: group.label || `${group.id}조`,
            bodyRenderer: () => null,
        });
    }

    return tabs;
}

/** 연도별 조·팀명 설정 (manual/season-teams.json) */
export function useSeasonTeams() {
    const { data, pending, error, reload } = useSiteData<SeasonTeamsConfig>('manual/season-teams.json');

    function groupsForYear(year: number | string) {
        return getSeasonGroupsForYear(data.value, year);
    }

    function tabItemsForYear(year: number | string, includeAll = true) {
        return buildRecordGroupTabItems(data.value, year, { includeAll });
    }

    function allGroupTabItems(includeAll = true) {
        return buildAllGroupTabItems(data.value, { includeAll });
    }

    function labelForGroup(groupId: string, year?: number | string) {
        return getGroupLabel(data.value, groupId, year);
    }

    return {
        config: data,
        pending,
        error,
        reload,
        groupsForYear,
        tabItemsForYear,
        allGroupTabItems,
        labelForGroup,
        allGroupIds: computed(() => getAllConfiguredGroupIds(data.value)),
    };
}
