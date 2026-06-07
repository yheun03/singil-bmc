import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { seoConfig, seoNoindexPrefixes } from '../../config/seo';
import { seoPageDefaults } from '../../config/seo-pages';

type NewsItem = { slug: string; updatedAt?: string; date?: string };
type GameItem = { gameId: string; gameDate?: string };

function shouldExcludePath(path: string): boolean {
    return seoNoindexPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function toIsoDate(value?: string): string | undefined {
    if (!value) return undefined;
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return undefined;
    return new Date(parsed).toISOString().slice(0, 10);
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, lastmod?: string): string {
    const lastmodTag = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : '';
    return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`;
}

async function readPublicJson<T>(filename: string): Promise<T> {
    const filePath = join(process.cwd(), 'public', 'data', filename);
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
}

/** sitemap.xml 본문 생성 */
export async function buildSitemapXml(): Promise<string> {
    const siteUrl = seoConfig.siteUrl.endsWith('/') ? seoConfig.siteUrl : `${seoConfig.siteUrl}/`;
    const staticPaths = Object.keys(seoPageDefaults).filter((path) => !shouldExcludePath(path));

    let news: NewsItem[] = [];
    let games: GameItem[] = [];

    try {
        [news, games] = await Promise.all([
            readPublicJson<NewsItem[]>('meta/news.json'),
            readPublicJson<GameItem[]>('generated/games.json'),
        ]);
    } catch {
        // generated 미생성 시 정적 URL만
    }

    const urls: string[] = [];

    for (const path of staticPaths) {
        const segment = path === '/' ? '' : path.replace(/^\//, '');
        urls.push(urlEntry(segment ? `${siteUrl}${segment}` : siteUrl));
    }

    for (const item of news) {
        if (!item.slug) continue;
        const lastmod = toIsoDate(item.updatedAt ?? item.date);
        urls.push(urlEntry(`${siteUrl}news/${item.slug}`, lastmod));
    }

    for (const game of games) {
        if (!game.gameId) continue;
        const lastmod = toIsoDate(game.gameDate);
        urls.push(urlEntry(`${siteUrl}games/${game.gameId}`, lastmod));
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
}
