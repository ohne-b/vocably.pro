#!/usr/bin/env -S npx vite-node

import type Anthropic from '@anthropic-ai/sdk';
import {
  getAnalyseCacheFileName,
  handleClaudeAnalyzeResponse,
} from '@vocably/analyze';
import { config } from 'dotenv-flow';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  claudeAnalyzeBatchPrefix,
  type ClaudeAnalyzePayloads,
  claudePayloadsDir,
  getFileName,
  languagesDir,
} from './claude-utils.js';
import { listFiles } from './utils.js';

config();

const files = (await listFiles('./data/results')).filter((file) =>
  getFileName(file).startsWith(claudeAnalyzeBatchPrefix)
);

if (files.length === 0) {
  console.log('No Claude units of speech results to process.');
}

mkdirSync('./data/processed', { recursive: true });

for (const file of files) {
  console.log(`Processing ${file}`);

  const batchName = getFileName(file).split('--')[0];
  const payloads: ClaudeAnalyzePayloads = JSON.parse(
    readFileSync(`${claudePayloadsDir}/${batchName}.json`).toString()
  );

  const items: Anthropic.Messages.MessageBatchIndividualResponse[] =
    readFileSync(file)
      .toString()
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line));

  console.log(`Contains ${items.length} items`);

  const failed: { source: string; partOfSpeech: string }[] = [];
  let saved = 0;

  for (const { custom_id, result } of items) {
    const payload = payloads[custom_id];

    if (!payload) {
      console.error(`Unknown custom_id ${custom_id}. Skipping.`);
      continue;
    }

    const { source, partOfSpeech } = payload;

    if (result.type !== 'succeeded') {
      console.error(`${source} (${partOfSpeech}): request ${result.type}`);
      failed.push({ source, partOfSpeech });
      continue;
    }

    const analysisResult = handleClaudeAnalyzeResponse(result.message, payload);

    if (!analysisResult.success) {
      console.error(
        `${source} (${partOfSpeech}): ${analysisResult.reason}`,
        analysisResult.extra
      );
      failed.push({ source, partOfSpeech });
      continue;
    }

    const filePath = `${languagesDir}/${getAnalyseCacheFileName(payload)}`;

    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(analysisResult.value));
    saved++;
  }

  console.log(`Saved ${saved} units of speech. Failed ${failed.length}.`);

  if (failed.length > 0) {
    const failedFile = `./data/failed-${batchName}.json`;
    writeFileSync(failedFile, JSON.stringify(failed, null, 2));
    console.log(`Failed items are saved to ${failedFile}`);
  }

  renameSync(file, `./data/processed/${getFileName(file)}`);
}
