import { buildSitemapXml } from '../utils/sitemap-build';

export default defineEventHandler(async (event) => {
    const body = await buildSitemapXml();
    setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8');
    return body;
});
