function pruneDuplicateInlineStyles() {
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]'));
    const linkHrefs = new Set(links.map((link) => link.getAttribute('href')).filter(Boolean));
    const styles = Array.from(document.querySelectorAll<HTMLStyleElement>('style[data-vite-dev-id]'));

    for (const style of styles) {
        const devId = style.dataset.viteDevId;
        if (!devId) continue;
        if (linkHrefs.has(devId)) style.remove();
    }
}

export default defineNuxtPlugin(() => {
    if (!import.meta.dev || !import.meta.client) return;

    pruneDuplicateInlineStyles();

    const observer = new MutationObserver(() => pruneDuplicateInlineStyles());
    observer.observe(document.head, { childList: true, subtree: true });
});
