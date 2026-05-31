import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export type RouteTab = {
    key: string;
    path: string;
    title: string;
    labelKey?: string;
};

export const useRouteTabsStore = defineStore('route-tabs', () => {
    const tabs = ref<RouteTab[]>([]);
    const activeKey = ref<string | null>(null);

    const activeTab = computed(() => (activeKey.value ? tabs.value.find((t) => t.key === activeKey.value) : null) ?? null);

    function visit(tab: { key: string; path: string; title: string; labelKey?: string }, opts?: { activate?: boolean }) {
        const existing = tabs.value.find((t) => t.key === tab.key);
        if (existing) {
            existing.path = tab.path;
            existing.title = tab.title;
            existing.labelKey = tab.labelKey;
        } else {
            tabs.value.push({ ...tab });
        }

        if (opts?.activate ?? true) activeKey.value = tab.key;
    }

    function activate(key: string) {
        if (!tabs.value.some((t) => t.key === key)) return;
        activeKey.value = key;
    }

    function close(key: string) {
        const idx = tabs.value.findIndex((t) => t.key === key);
        if (idx < 0) return;
        tabs.value.splice(idx, 1);

        if (activeKey.value !== key) return;
        const fallback = tabs.value[Math.max(0, idx - 1)] ?? tabs.value[0] ?? null;
        activeKey.value = fallback?.key ?? null;
    }

    function reset() {
        tabs.value.splice(0, tabs.value.length);
        activeKey.value = null;
    }

    return {
        tabs,
        activeKey,
        activeTab,
        visit,
        activate,
        close,
        reset,
    };
});
