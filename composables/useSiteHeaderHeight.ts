/** sticky LNB 등에서 헤더 아래 offset 계산에 사용 */
export const SITE_HEADER_HEIGHT_VAR = '--bmc-header-height';

export function useSiteHeaderHeight(headerRef: Ref<HTMLElement | null>) {
    if (import.meta.server) {
        return;
    }

    let observer: ResizeObserver | null = null;

    function setHeight(el: HTMLElement) {
        document.documentElement.style.setProperty(SITE_HEADER_HEIGHT_VAR, `${el.offsetHeight}px`);
    }

    watch(
        headerRef,
        (el, _, onCleanup) => {
            observer?.disconnect();
            observer = null;

            if (!el) {
                return;
            }

            setHeight(el);
            observer = new ResizeObserver(() => setHeight(el));
            observer.observe(el);

            onCleanup(() => observer?.disconnect());
        },
        { immediate: true },
    );
}
