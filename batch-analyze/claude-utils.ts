import Anthropic from '@anthropic-ai/sdk';
import {
  type getClaudeAnalyzeBatchItem,
  type getClaudeTranslationBatchItem,
} from '@vocably/analyze';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export const languagesDir = './../../vocably-languages';
export const claudePayloadsDir = './data/claude-payloads';
export const claudeBatchPrefix = 'claude-';
export const claudeTranslateBatchPrefix = `${claudeBatchPrefix}translate-`;
export const claudeAnalyzeBatchPrefix = `${claudeBatchPrefix}analyze-`;

const claudeJobsFile = './claude-jobs.jsonl';

export type ClaudeJob = {
  file: string;
  batch: Anthropic.Messages.MessageBatch;
  downloaded: boolean;
};

export type TranslateUnitOfSpeechPayload = Parameters<
  typeof getClaudeTranslationBatchItem
>[0];

export type ClaudePayloads = Record<string, TranslateUnitOfSpeechPayload>;

export type AnalyzeUnitOfSpeechPayload = Parameters<
  typeof getClaudeAnalyzeBatchItem
>[0];

export type ClaudeAnalyzePayloads = Record<string, AnalyzeUnitOfSpeechPayload>;

export const createClaudeClient = () =>
  new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

export const readClaudeJobs = (): ClaudeJob[] => {
  if (!existsSync(claudeJobsFile)) {
    return [];
  }

  return readFileSync(claudeJobsFile)
    .toString()
    .split('\n')
    .filter((j) => j.length > 0)
    .map((j) => JSON.parse(j));
};

export const writeClaudeJobs = (jobs: ClaudeJob[]) => {
  writeFileSync(claudeJobsFile, jobs.map((j) => JSON.stringify(j)).join('\n'));
};

export const getFileName = (path: string): string =>
  path.split('/').pop() ?? path;

export const isClaudeFile = (path: string): boolean =>
  getFileName(path).startsWith(claudeBatchPrefix);
