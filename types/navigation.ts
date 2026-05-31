export interface NavigationMenu {
    id: string;
    parentId?: string | null;
    label: string;
    labelKey?: string;
    to: string;
    order: number;
    icon?: string;
    newTab?: boolean;
    depth: number;
    children?: NavigationMenu[];
}

export type NavigationAction = {
    label: string;
    icon: string;
};

export const NAVIGATION_HEADER_ACTIONS: NavigationAction[] = [
    { label: '메모 추가', icon: 'mdi:pencil-outline' },
    { label: '메모 폴더 추가', icon: 'mdi:folder-plus-outline' },
    { label: '메모 필터 적용', icon: 'mdi:filter-variant' },
    { label: '현재 열린 메모 표시', icon: 'mdi:target' },
    { label: '메모 검색', icon: 'mdi:magnify' },
];
