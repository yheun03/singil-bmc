export type AppRoute = {
    path: string;
    name?: string | symbol | null;
    meta?: Record<string, unknown>;
};

export const ROUTE_HIDDEN_PATHS = ['/auth/sign-in', '/auth/sign-up', '/auth/find-pw', '/demos'] as const;

export function isVisibleRoute(path: string): boolean {
    if (!path) return false;
    if (path.includes(':')) return false;
    if (ROUTE_HIDDEN_PATHS.includes(path as (typeof ROUTE_HIDDEN_PATHS)[number])) return false;

    return path === '/' || path === '/workspace' || path === '/settings' || path.startsWith('/demos/');
}

export function getRouteLabel(path: string, route?: AppRoute): string {
    const metaTitle = route?.meta?.title;
    if (typeof metaTitle === 'string' && metaTitle.trim()) return metaTitle;

    const nameLabel = route?.name;
    if (typeof nameLabel === 'string' && nameLabel.trim()) return nameLabel;

    const segment = path.split('/').filter(Boolean).at(-1) ?? 'page';
    return segment
        .replace(/^demo-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getRouteTitle(route: AppRoute): string {
    return getRouteLabel(route.path, route);
}
