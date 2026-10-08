import { XMLParser } from 'fast-xml-parser';

export type SitemapEntry = {
  loc: string;
  lastmod: string;
  priority: string;
  hash: string;
  renderHash: string;
};

export const getExistingSeoSearchSitemap = async (
  baseUrl: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<Array<SitemapEntry>> => {
  const url = `${baseUrl}/${sourceLanguage}-${targetLanguage}/sitemap.xml`;

  const response = await fetch(url);

  // The sitemap doesn't exist before the first deploy of a language pair.
  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sitemap from ${url}: ${response.status} ${response.statusText}`
    );
  }

  const xmlText = await response.text();

  const parser = new XMLParser();
  const parsed = parser.parse(xmlText);

  if (!parsed.urlset || !parsed.urlset.url) {
    throw new Error('Invalid sitemap format: missing urlset or url elements');
  }

  const urls = Array.isArray(parsed.urlset.url)
    ? parsed.urlset.url
    : [parsed.urlset.url];

  return urls.map((entry: any) => ({
    loc: entry.loc || '',
    lastmod: entry.lastmod || '',
    priority: entry.priority || '',
    hash: entry.hash || '',
    renderHash: entry.renderhash || '',
  }));
};
