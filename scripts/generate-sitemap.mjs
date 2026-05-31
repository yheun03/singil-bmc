/**
 * public/sitemap.xml 생성 (GitHub Pages 정적 배포용)
 * nuxt generate 시 prerender와 함께 최신 URL 목록을 유지한다.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jiti = createJiti(root, {
    alias: {
        '~': root,
        '~~': root,
    },
});

const { buildSitemapXml } = await jiti.import('../server/utils/sitemap-build.ts');
const xml = await buildSitemapXml();
const outPath = join(root, 'public', 'sitemap.xml');

await writeFile(outPath, xml, 'utf8');
console.log(`[generate-sitemap] wrote ${outPath}`);
