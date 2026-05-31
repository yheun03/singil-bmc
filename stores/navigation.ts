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
    { id: 'MENU_010000', parentId: null, depth: 1, order: 1, to: '/', labelKey: 'nav.home', isActive: true },
    {
        id: 'MENU_010100',
        parentId: null,
        depth: 1,
        order: 2,
        to: '/workspace',
        labelKey: 'nav.workspace',
        isActive: true,
    },
    { id: 'MENU_020000', parentId: null, depth: 1, order: 3, to: '', labelKey: 'nav.demos', isActive: true },
    {
        id: 'MENU_020001',
        parentId: 'MENU_020000',
        depth: 2,
        order: 1,
        to: '/demos/demo-button',
        labelKey: 'nav.demo.button',
        isActive: true,
    },
    {
        id: 'MENU_020002',
        parentId: 'MENU_020000',
        depth: 2,
        order: 2,
        to: '/demos/demo-input',
        labelKey: 'nav.demo.input',
        isActive: true,
    },
    {
        id: 'MENU_020003',
        parentId: 'MENU_020000',
        depth: 2,
        order: 3,
        to: '/demos/demo-grid',
        labelKey: 'nav.demo.grid',
        isActive: true,
    },
    {
        id: 'MENU_020004',
        parentId: 'MENU_020000',
        depth: 2,
        order: 4,
        to: '/demos/demo-chart',
        labelKey: 'nav.demo.chart',
        isActive: true,
    },
    {
        id: 'MENU_020005',
        parentId: 'MENU_020000',
        depth: 2,
        order: 5,
        to: '/demos/demo-progress',
        labelKey: 'nav.demo.progress',
        isActive: true,
    },
    {
        id: 'MENU_020006',
        parentId: 'MENU_020000',
        depth: 2,
        order: 6,
        to: '/demos/demo-datepicker',
        labelKey: 'nav.demo.datepicker',
        isActive: true,
    },
    {
        id: 'MENU_020007',
        parentId: 'MENU_020000',
        depth: 2,
        order: 7,
        to: '/demos/demo-select',
        labelKey: 'nav.demo.select',
        isActive: true,
    },
    {
        id: 'MENU_020008',
        parentId: 'MENU_020000',
        depth: 2,
        order: 8,
        to: '/demos/demo-choice',
        labelKey: 'nav.demo.choice',
        isActive: true,
    },
    {
        id: 'MENU_020009',
        parentId: 'MENU_020000',
        depth: 2,
        order: 9,
        to: '/demos/demo-upload-image',
        labelKey: 'nav.demo.uploadImage',
        isActive: true,
    },
    {
        id: 'MENU_020010',
        parentId: 'MENU_020000',
        depth: 2,
        order: 10,
        to: '/demos/demo-upload-file',
        labelKey: 'nav.demo.uploadFile',
        isActive: true,
    },
    {
        id: 'MENU_020011',
        parentId: 'MENU_020000',
        depth: 2,
        order: 11,
        to: '/demos/demo-modal',
        labelKey: 'nav.demo.modal',
        isActive: true,
    },
    {
        id: 'MENU_020012',
        parentId: 'MENU_020000',
        depth: 2,
        order: 12,
        to: '/demos/demo-table',
        labelKey: 'nav.demo.table',
        isActive: true,
    },
    {
        id: 'MENU_020013',
        parentId: 'MENU_020000',
        depth: 2,
        order: 12,
        to: '/demos/demo-section',
        labelKey: 'nav.demo.section',
        isActive: true,
    },
    {
        id: 'MENU_020014',
        parentId: 'MENU_020000',
        depth: 2,
        order: 13,
        to: '/demos/demo-accordion',
        labelKey: 'nav.demo.accordion',
        isActive: true,
    },
    {
        id: 'MENU_020015',
        parentId: 'MENU_020000',
        depth: 2,
        order: 14,
        to: '/demos/demo-tabs',
        labelKey: 'nav.demo.tabs',
        isActive: true,
    },
    {
        id: 'MENU_020016',
        parentId: 'MENU_020000',
        depth: 2,
        order: 15,
        to: '/demos/demo-form-field',
        labelKey: 'nav.demo.form',
        isActive: true,
    },
    {
        id: 'MENU_020017',
        parentId: 'MENU_020000',
        depth: 2,
        order: 16,
        to: '/demos/demo-pagination',
        labelKey: 'nav.demo.pagination',
        isActive: true,
    },
    {
        id: 'MENU_020018',
        parentId: 'MENU_020000',
        depth: 2,
        order: 17,
        to: '/demos/demo-textarea',
        labelKey: 'nav.demo.textArea',
        isActive: true,
    },
    {
        id: 'MENU_030000',
        parentId: null,
        depth: 1,
        order: 4,
        to: '/settings',
        labelKey: 'nav.settings',
        isActive: true,
    },
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
