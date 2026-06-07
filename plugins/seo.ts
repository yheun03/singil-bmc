/**
 * 전역 단일 useSeo — 라우트·페이지 오버라이드(useSeoPageState)를 합쳐 메타를 적용한다.
 */
export default defineNuxtPlugin(() => {
    const route = useRoute();

    useSeo(() => {
        const path = route.path;

        if (route.meta.layout === false || shouldSeoNoindex(path)) {
            return {
                path,
                noindex: true,
                title: typeof route.meta.title === 'string' ? route.meta.title : undefined,
                skipDefaults: true,
            };
        }

        return { path };
    });
});
