#!/usr/bin/env -S npx vite-node

import { config } from 'dotenv-flow';
import { createWriteStream, mkdirSync } from 'node:fs';
import { finished } from 'node:stream/promises';
import {
  type ClaudeJob,
  createClaudeClient,
  readClaudeJobs,
  writeClaudeJobs,
} from './claude-utils.js';

config();

const client = createClaudeClient();

const downloadResults = async (job: ClaudeJob) => {
  mkdirSync('./data/results', { recursive: true });

  // Keep the batch file name so the payloads map can be found later.
  const downloadPath = `./data/results/${job.file.replace(
    /\.jsonl$/,
    ''
  )}--${job.batch.id}.jsonl`;

  const stream = createWriteStream(downloadPath);

  for await (const result of await client.messages.batches.results(
    job.batch.id
  )) {
    stream.write(JSON.stringify(result) + '\n');
  }

  stream.end();
  await finished(stream);

  console.log(`Downloaded results of ${job.batch.id} to ${downloadPath}`);
};

while (true) {
  const jobs = readClaudeJobs();
  const pendingJobs = jobs.filter((j) => !j.downloaded);

  if (pendingJobs.length === 0) {
    console.log('All jobs are completed.');
    break;
  }

  console.log(`Jobs to check: ${pendingJobs.length}`);

  for (const job of pendingJobs) {
    job.batch = await client.messages.batches.retrieve(job.batch.id);

    const { processing, succeeded, errored, canceled, expired } =
      job.batch.request_counts;

    console.log(
      `Batch ${job.batch.id} is ${job.batch.processing_status}: processing ${processing}, succeeded ${succeeded}, errored ${errored}, canceled ${canceled}, expired ${expired}`
    );

    if (job.batch.processing_status === 'ended') {
      await downloadResults(job);
      job.downloaded = true;
    }

    writeClaudeJobs(jobs);
  }

  if (jobs.every((j) => j.downloaded)) {
    continue;
  }

  console.log('Waiting for 60 seconds...');
  await new Promise((resolve) => setTimeout(resolve, 60000));
}
