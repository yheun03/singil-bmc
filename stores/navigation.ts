import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useI18nText } from '~/composables/useI18nText';
import type { NavigationMenu } from '~/types/navigation';

type MutableNavigationMenu = Omit<NavigationMenu, 'children'> & {
    children?: MutableNavigationMenu[];
};

type MenuSeedEntity = {
    id: string;
    parentId: string | null;
    depth: number;
    order: number;
    to: string;
    labelKey: string;
    icon?: string;
    newTab?: boolean;
    isActive: boolean;
};

const MENU_SEED: MenuSeedEntity[] = [
    { id: 'MENU_HOME', parentId: null, depth: 1, order: 1, to: '/', labelKey: 'nav.home', isActive: true },

    { id: 'MENU_ABOUT', parentId: null, depth: 1, order: 2, to: '', labelKey: 'nav.about', isActive: true },
    {
        id: 'MENU_ABOUT_INDEX',
        parentId: 'MENU_ABOUT',
        depth: 2,
        order: 1,
        to: '/about',
        labelKey: 'nav.about.intro',
        isActive: true,
    },
    {
        id: 'MENU_ABOUT_LEADERS',
        parentId: 'MENU_ABOUT',
        depth: 2,
        order: 2,
        to: '/about/leaders',
        labelKey: 'nav.about.leaders',
        isActive: true,
    },
    {
        id: 'MENU_ABOUT_HISTORY',
        parentId: 'MENU_ABOUT',
        depth: 2,
        order: 3,
        to: '/about/history',
        labelKey: 'nav.about.history',
        isActive: true,
    },

    { id: 'MENU_RECORDS', parentId: null, depth: 1, order: 3, to: '', labelKey: 'nav.records', isActive: true },
    {
        id: 'MENU_RECORDS_INDEX',
        parentId: 'MENU_RECORDS',
        depth: 2,
        order: 1,
        to: '/records',
        labelKey: 'nav.records.total',
        isActive: true,
    },
    {
        id: 'MENU_RECORDS_YEARLY',
        parentId: 'MENU_RECORDS',
        depth: 2,
        order: 2,
        to: '/records/yearly',
        labelKey: 'nav.records.yearly',
        isActive: true,
    },
    {
        id: 'MENU_RECORDS_MONTHLY',
        parentId: 'MENU_RECORDS',
        depth: 2,
        order: 3,
        to: '/records/monthly',
        labelKey: 'nav.records.monthly',
        isActive: true,
    },
    {
        id: 'MENU_RECORDS_GROUPS',
        parentId: 'MENU_RECORDS',
        depth: 2,
        order: 4,
        to: '/records/groups',
        labelKey: 'nav.records.groups',
        isActive: true,
    },

    { id: 'MENU_MVP', parentId: null, depth: 1, order: 4, to: '', labelKey: 'nav.mvp', isActive: true },
    {
        id: 'MENU_MVP_MONTHLY',
        parentId: 'MENU_MVP',
        depth: 2,
        order: 1,
        to: '/mvp/monthly',
        labelKey: 'nav.mvp.monthly',
        isActive: true,
    },
    {
        id: 'MENU_MVP_WEEKLY',
        parentId: 'MENU_MVP',
        depth: 2,
        order: 2,
        to: '/mvp/weekly',
        labelKey: 'nav.mvp.weekly',
        isActive: true,
    },

    { id: 'MENU_GALLERY', parentId: null, depth: 1, order: 5, to: '', labelKey: 'nav.gallery', isActive: true },
    {
        id: 'MENU_GALLERY_TEAM',
        parentId: 'MENU_GALLERY',
        depth: 2,
        order: 1,
        to: '/gallery/team',
        labelKey: 'nav.gallery.team',
        isActive: true,
    },

    { id: 'MENU_VIDEOS', parentId: null, depth: 1, order: 6, to: '', labelKey: 'nav.videos', isActive: true },
    {
        id: 'MENU_VIDEOS_INDEX',
        parentId: 'MENU_VIDEOS',
        depth: 2,
        order: 1,
        to: '/videos',
        labelKey: 'nav.videos.youtube',
        isActive: true,
    },

    { id: 'MENU_NEWS', parentId: null, depth: 1, order: 7, to: '/news', labelKey: 'nav.news', isActive: true },
    { id: 'MENU_CONTACT', parentId: null, depth: 1, order: 8, to: '/contact', labelKey: 'nav.contact', isActive: true },
];

function createNavigationMenus(): NavigationMenu[] {
    return MENU_SEED.filter((row) => row.isActive)
        .sort((a, b) => {
            if (a.depth !== b.depth) return a.depth - b.depth;
            return a.order - b.order;
        })
        .map((row) => ({
            id: row.id,
            parentId: row.parentId,
            depth: row.depth,
            order: row.order,
            label: row.labelKey,
            labelKey: row.labelKey,
            to: row.to,
            icon: row.icon,
            newTab: row.newTab ?? false,
        }));
}

function translateNavigationMenus(items: readonly NavigationMenu[], t?: (key: string, fallback?: string) => string): NavigationMenu[] {
    if (!t) return [...items];
    return items.map((item) => ({
        ...item,
        label: item.labelKey ? t(item.labelKey, item.label) : item.label,
        children: item.children ? translateNavigationMenus(item.children, t) : undefined,
    }));
}

function buildNavigationTree(items: readonly NavigationMenu[]): NavigationMenu[] {
    const nodeMap = new Map<string, MutableNavigationMenu>();
    const roots: MutableNavigationMenu[] = [];

    for (const item of items) {
        nodeMap.set(item.id, {
            ...item,
            children: undefined,
        });
    }

    for (const item of items) {
        const node = nodeMap.get(item.id);
        if (!node) continue;

        const parentId = item.parentId ?? null;
        if (!parentId) {
            roots.push(node);
            continue;
        }

        const parent = nodeMap.get(parentId);
        if (!parent) {
            roots.push(node);
            continue;
        }

        (parent.children ||= []).push(node);
    }

    const sortNavigationTree = (nodes: MutableNavigationMenu[]): NavigationMenu[] =>
        [...nodes]
            .sort((a, b) => a.order - b.order)
            .map((node) => ({
                ...node,
                children: node.children ? sortNavigationTree(node.children) : undefined,
            }));

    return sortNavigationTree(roots);
}

export const useNavigationStore = defineStore('navigation', () => {
    const { t } = useI18nText();
    const menus = ref<NavigationMenu[]>([]);
    const isLoading = ref(false);
    const isLoaded = ref(false);

    const localizedMenus = computed(() => translateNavigationMenus(menus.value, t));
    const menuTree = computed(() => buildNavigationTree(localizedMenus.value));

    async function fetchMenus(force = false) {
        if (isLoading.value) return;
        if (isLoaded.value && !force) return;

        isLoading.value = true;
        try {
            menus.value = createNavigationMenus();
            isLoaded.value = true;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        menus,
        menuTree,
        isLoading,
        isLoaded,
        fetchMenus,
    };
});
