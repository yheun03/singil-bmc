import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type NewsItem = { slug: string };
type GameItem = { gameId: string };

/** generate 시 경기·소식 상세 HTML prerender 경로 */
export function collectDynamicPrerenderRoutes(): string[] {
    const root = process.cwd();
    const routes: string[] = [];

    try {
        const news = JSON.parse(
            readFileSync(join(root, 'public/data/meta/news.json'), 'utf8'),
        ) as NewsItem[];
        for (const item of news) {
            if (item.slug) routes.push(`/news/${item.slug}`);
        }
    } catch {
        // 데이터 없음 시 무시
    }

    try {
        const games = JSON.parse(
            readFileSync(join(root, 'public/data/generated/games.json'), 'utf8'),
        ) as GameItem[];
        for (const game of games) {
            if (game.gameId) routes.push(`/games/${game.gameId}`);
        }
    } catch {
        // generated 미생성 시 무시
    }

    return routes;
}
