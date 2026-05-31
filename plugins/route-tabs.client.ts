import { useRouteTabsStore } from '~/stores/route-tabs';
import { useNavigationStore } from '~/stores/navigation';
import { getRouteTitle, isVisibleRoute } from '~/router';
import type { RouteLocationNormalized } from 'vue-router';

export default defineNuxtPlugin(() => {
    const router = useRouter();
    const store = useRouteTabsStore();
    const navigationStore = useNavigationStore();

    const track = (to: RouteLocationNormalized) => {
        if (!to.path) return;
        if (!isVisibleRoute(to.path)) return;

        const menu = navigationStore.menus.find((item) => item.to === to.path);
        const title =
            menu?.label ??
            getRouteTitle({
                path: to.path,
                name: to.name,
                meta: to.meta as Record<string, unknown>,
            });

        store.visit({
            key: to.fullPath,
            path: to.fullPath,
            title,
            labelKey: menu?.labelKey,
        });
    };

    router.afterEach((to) => track(to));
    track(router.currentRoute.value);
});
