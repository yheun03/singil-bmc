/**
 * 스크롤 진입 시 섹션/카드가 부드럽게 나타나는 인터랙션.
 * 점진적 향상: JS가 동작할 때만 html.js-reveal 가 붙고, 그때만 CSS가 숨김→표시를 적용한다.
 * (JS 실패 시 콘텐츠는 항상 보인다)
 */
const REVEAL_SELECTOR = [
    '.bmc-section',
    '.bmc-recordbar',
    '.bmc-matches',
    '.bmc-match-card',
    '.bmc-roster-card',
    '.bmc-game-card',
    '.bmc-video-card',
    '.bmc-leader-card',
    '.bmc-link-card',
    '.bmc-stat-card',
    '.bmc-timeline__item',
].join(',');

export default defineNuxtPlugin((nuxtApp) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
        return;
    }

    const root = document.documentElement;
    root.classList.add('js-reveal');

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    observer.unobserve(entry.target);
                }
            }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    function scan() {
        document.querySelectorAll(`${REVEAL_SELECTOR}`).forEach((el) => {
            if (!el.classList.contains('is-in') && !(el as HTMLElement).dataset.revealObserved) {
                (el as HTMLElement).dataset.revealObserved = '1';
                observer.observe(el);
            }
        });
    }

    let scheduled = false;
    function scheduleScan() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            scan();
        });
    }

    // 비동기로 추가되는 카드(경기·선수·리더 등)까지 잡기 위해 DOM 변화를 감시
    const mo = new MutationObserver(scheduleScan);

    // 라우트 전환마다 새 요소를 다시 스캔
    const router = nuxtApp.$router as { afterEach?: (cb: () => void) => void } | undefined;
    router?.afterEach?.(() => scheduleScan());

    nuxtApp.hook('app:mounted', () => {
        scheduleScan();
        mo.observe(document.body, { childList: true, subtree: true });
    });
});
