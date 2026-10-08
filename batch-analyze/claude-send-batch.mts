#!/usr/bin/env -S npx vite-node

import type Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv-flow';
import { mkdirSync, readFileSync, renameSync } from 'node:fs';
import {
  createClaudeClient,
  getFileName,
  isClaudeFile,
  readClaudeJobs,
  writeClaudeJobs,
} from './claude-utils.js';
import { listFiles } from './utils.js';

config();

const client = createClaudeClient();

const batchFilesToSend = (await listFiles('./data/batches')).filter(
  isClaudeFile
);

if (batchFilesToSend.length === 0) {
  console.log('No Claude batch files to send.');
}

mkdirSync('./data/sent-batches', { recursive: true });

for (const fileName of batchFilesToSend) {
  const requests: Anthropic.Messages.BatchCreateParams.Request[] = readFileSync(
    fileName,
    'utf-8'
  )
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));

  if (requests.length === 0) {
    console.error(`File ${fileName} is empty. Skipping.`);
    continue;
  }

  console.log(`Sending ${requests.length} requests from ${fileName}`);

  const batch = await client.messages.batches.create({ requests });

  console.log(`Created batch ${batch.id}: ${batch.processing_status}`);

  writeClaudeJobs([
    ...readClaudeJobs(),
    { file: getFileName(fileName), batch, downloaded: false },
  ]);

  renameSync(fileName, `./data/sent-batches/${getFileName(fileName)}`);
}
