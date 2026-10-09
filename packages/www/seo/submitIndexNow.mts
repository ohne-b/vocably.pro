#!/usr/bin/env -S npx vite-node

import { submitIndexNowUrls } from './indexNow';

// Runs after the production upload. A failed ping isn't worth failing the
// deploy over, so it only gets reported.
try {
  // @ts-ignore
  await submitIndexNowUrls();
} catch (error) {
  console.warn(error);
}
