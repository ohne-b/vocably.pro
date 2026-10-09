import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import { fetchSitemap, parseSitemap } from './getExistingSeoSearchSitemap';

// Served as /<key>.txt so search engines can verify the submissions.
export const indexNowKey = 'b1b6416441364956a57dd9e39a8437a8';

const urlsFile = './seo/indexnow-urls.json';

// IndexNow accepts at most 10,000 URLs per request.
const maxUrlsPerRequest = 10000;

const parseSitemapLocs = (xml: string): string[] => {
  const parsed = new XMLParser().parse(xml);
  const entries = parsed?.sitemapindex?.sitemap ?? [];
  return (Array.isArray(entries) ? entries : [entries]).map(
    (entry: any) => entry.loc
  );
};

const toRelativePath = (loc: string) => loc.replace(/^https?:\/\/[^/]+\//, '');

/**
 * Compares the sitemaps in ./dist with the ones currently deployed and stores
 * the URLs whose lastmod changed (or that are new) for `submitIndexNowUrls`.
 * Has to run before the upload, while the deployed sitemaps are still old.
 */
export const collectIndexNowUrls = async (deployedBaseUrl: string) => {
  const sitemapPaths = parseSitemapLocs(
    readFileSync('./dist/sitemap.xml', 'utf-8')
  ).map(toRelativePath);

  const urls: string[] = [];

  for (const sitemapPath of sitemapPaths) {
    const built = parseSitemap(readFileSync(`./dist/${sitemapPath}`, 'utf-8'));
    const deployed = new Map(
      (await fetchSitemap(`${deployedBaseUrl}/${sitemapPath}`)).map((entry) => [
        entry.loc,
        entry.lastmod,
      ])
    );

    for (const { loc, lastmod } of built) {
      if (deployed.get(loc) !== lastmod) {
        urls.push(loc);
      }
    }
  }

  writeFileSync(urlsFile, JSON.stringify(urls, null, 2));
  console.log(`IndexNow: ${urls.length} updated URL(s) collected.`);
};

export const submitIndexNowUrls = async () => {
  if (!existsSync(urlsFile)) {
    throw new Error(`${urlsFile} is missing. Run the build first.`);
  }

  const urls: string[] = JSON.parse(readFileSync(urlsFile, 'utf-8'));

  if (urls.length === 0) {
    console.log('IndexNow: nothing to submit.');
    return;
  }

  const { origin, host } = new URL(urls[0]);

  for (let i = 0; i < urls.length; i += maxUrlsPerRequest) {
    const urlList = urls.slice(i, i + maxUrlsPerRequest);
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: indexNowKey,
        keyLocation: `${origin}/${indexNowKey}.txt`,
        urlList,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `IndexNow submission failed: ${response.status} ${response.statusText} ${await response.text()}`
      );
    }

    console.log(`IndexNow: submitted ${urlList.length} URL(s).`);
  }
};
