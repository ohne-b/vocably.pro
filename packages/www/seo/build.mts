#!/usr/bin/env -S npx vite-node

import { buildStaticSearchPages } from './buildStaticSearchPages';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { buildMainSitemap } from './buildMainSitemap';
import { buildSitemapIndex } from './buildSitemapIndex';

const { environment } = createRequire(import.meta.url)('../environment.js');

// @ts-ignore
await buildStaticSearchPages({
  searchDataFolder: `./seo/${environment.searchSeoDataFolder}`,
  basePath: 'https://vocably.pro',
  deployedBaseUrl: environment.baseUrl,
  templateHtml: readFileSync('./dist/search.html', 'utf-8'),
  searchPageFileName: 'search.html',
});

buildMainSitemap();
await buildSitemapIndex();
