#!/usr/bin/env -S npx vite-node

import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const edgeKey =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAit47weXUG/mSAlRVA0tZ' +
  'zCiXUH0ZuYpurQbHMxNzBoCeFfFq45XRuDCusozQ412Pi6mqrO56uyu2GAQrgZJQ' +
  'a31kUjYDu73VnfVU85gI7WtU+klkWNz8GPK4DzNOOEE4tdi5IG5NcgVFtG+7lfPk' +
  'sDCZkkQ3YhIi081fB5Q3TodNnH+cvhEbKK/tXDLwGo/B3nTEbc/4+/ALZ6KlV8/2' +
  '1ZVe1dDWWVJQVOtQMFCJgz9gOGsqnu+2GbF+9zQfIo1GQ2B4pRi4ta6UMs6E/Fqe' +
  'SDcmOAHUds8tnqldVJ14dgo9z6XKKxnsjCd3sZKFw8+z1Ds9hJmLHuUQata6yt8l' +
  'SwIDAQAB';

const environments = ['dev', 'prod'] as const;

type Environment = (typeof environments)[number];

const isEnvironment = (value: string): value is Environment =>
  environments.includes(value as Environment);

const env = (process.argv[2] ?? '').trim();

if (!isEnvironment(env)) {
  console.error(
    `Usage: ./scripts/build-edge-extension.mts <${environments.join(
      '|'
    )}> [version]`
  );
  process.exit(1);
}

const artifactsUrl = `http://vocably-${env}-artifacts.s3-website.eu-central-1.amazonaws.com`;

let version = (process.argv[3] ?? 'latest').trim().replace(/\./g, '_');

if (version !== 'latest' && !version.startsWith(`${env}_`)) {
  version = `${env}_${version}`;
}

const sourceUrl = `${artifactsUrl}/${version}.zip`;

const outputDir = `${rootDir}/tmp/edge`;

const workingDir = mkdtempSync(`${tmpdir()}/vocably-edge-`);
const downloadPath = `${workingDir}/${version}.zip`;
const unpackedDir = `${workingDir}/unpacked`;

try {
  console.log(`Downloading ${sourceUrl}...`);
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to download ${sourceUrl}: ${response.status} ${response.statusText}`
    );
  }

  writeFileSync(downloadPath, new Uint8Array(await response.arrayBuffer()));

  console.log('Unpacking...');
  execFileSync('unzip', ['-q', downloadPath, '-d', unpackedDir], {
    stdio: 'inherit',
  });

  const manifestPath = `${unpackedDir}/manifest.json`;

  if (!existsSync(manifestPath)) {
    throw new Error(`The ${version}.zip archive doesn't contain manifest.json`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  if (typeof manifest.version !== 'string' || !manifest.version) {
    throw new Error("The manifest.json doesn't contain a version");
  }

  const outputName = `${env}_${manifest.version.replace(/\./g, '_')}`;
  const outputPath = `${outputDir}/${outputName}.zip`;
  const outputStorePath = `${outputDir}/${outputName}_store.zip`;
  const outputUnpackedPath = `${outputDir}/${outputName}`;

  mkdirSync(outputDir, { recursive: true });
  rmSync(outputPath, { force: true });
  rmSync(outputStorePath, { force: true });
  rmSync(outputUnpackedPath, { recursive: true, force: true });

  console.log('Packing the store version without the "key" param...');
  delete manifest.key;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  execFileSync('zip', ['-9', '-y', '-r', '-q', outputStorePath, '.'], {
    cwd: unpackedDir,
    stdio: 'inherit',
  });

  console.log('Setting the "key" param in manifest.json...');
  manifest.key = edgeKey;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('Saving the unpacked version...');
  cpSync(unpackedDir, outputUnpackedPath, { recursive: true });

  console.log('Packing...');
  execFileSync('zip', ['-9', '-y', '-r', '-q', outputPath, '.'], {
    cwd: unpackedDir,
    stdio: 'inherit',
  });

  console.log(outputUnpackedPath);
  console.log(outputPath);
  console.log(outputStorePath);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  rmSync(workingDir, { recursive: true, force: true });
}
