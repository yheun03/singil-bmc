import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type WorkspaceTab = {
    id: string;
    title: string;
    content: string;
};

type PaneId = 'left' | 'right';

export const useWorkspaceStore = defineStore('workspace', () => {
    const tabs = ref<WorkspaceTab[]>([
        {
            id: 'welcome',
            title: 'Welcome',
            content: '# Welcome\n\n옵시디언 스타일 워크스페이스 MVP입니다.\n',
        },
    ]);
    const activeTabId = ref<string>('welcome');

    const split = ref(false);
    const activeTabIdByPane = ref<Record<PaneId, string>>({
        left: 'welcome',
        right: 'welcome',
    });

    const activeTab = computed(() => tabs.value.find((t) => t.id === activeTabId.value) ?? tabs.value[0]);

    const paneTab = (pane: PaneId) => computed(() => tabs.value.find((t) => t.id === activeTabIdByPane.value[pane]) ?? tabs.value[0]);

    const leftTab = paneTab('left');
    const rightTab = paneTab('right');

    function ensureTab(id: string) {
        const existing = tabs.value.find((t) => t.id === id);
        if (existing) return existing;
        const t: WorkspaceTab = { id, title: id, content: '' };
        tabs.value.push(t);
        return t;
    }

    function openTab(id: string, title?: string) {
        const t = ensureTab(id);
        if (title) t.title = title;
        activeTabId.value = t.id;
        activeTabIdByPane.value.left = t.id;
        if (!split.value) activeTabIdByPane.value.right = t.id;
    }

    function closeTab(id: string) {
        if (tabs.value.length <= 1) return;
        const idx = tabs.value.findIndex((t) => t.id === id);
        if (idx < 0) return;
        tabs.value.splice(idx, 1);

        const fallback = tabs.value[Math.max(0, idx - 1)]?.id ?? tabs.value[0]?.id;
        if (!fallback) return;

        if (activeTabId.value === id) activeTabId.value = fallback;
        ['left', 'right'].forEach((pane) => {
            if (activeTabIdByPane.value[pane as PaneId] === id) {
                activeTabIdByPane.value[pane as PaneId] = fallback;
            }
        });
    }

    function setActiveTab(id: string) {
        if (!tabs.value.some((t) => t.id === id)) return;
        activeTabId.value = id;
        activeTabIdByPane.value.left = id;
        if (!split.value) activeTabIdByPane.value.right = id;
    }

    function setActiveTabForPane(pane: PaneId, id: string) {
        if (!tabs.value.some((t) => t.id === id)) return;
        activeTabIdByPane.value[pane] = id;
        if (pane === 'left') activeTabId.value = id;
    }

    function updateTabContent(id: string, content: string) {
        const t = tabs.value.find((x) => x.id === id);
        if (!t) return;
        t.content = content;
    }

    function toggleSplit() {
        split.value = !split.value;
        if (!split.value) {
            activeTabIdByPane.value.right = activeTabIdByPane.value.left;
        }
    }

    return {
        tabs,
        activeTabId,
        activeTab,
        split,
        leftTab,
        rightTab,
        activeTabIdByPane,
        openTab,
        closeTab,
        setActiveTab,
        setActiveTabForPane,
        updateTabContent,
        toggleSplit,
    };
});
