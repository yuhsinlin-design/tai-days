#!/usr/bin/env node
/**
 * Syncs every content/YYYY-MM.csv file to Google Sheets, in chronological order.
 * Skips files that are already fully synced (the per-month script handles deduplication).
 *
 * Usage:
 *   npm run sync:all
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');

const files = fs.readdirSync(CONTENT_DIR)
  .filter(f => /^\d{4}-\d{2}\.csv$/.test(f))
  .sort();

if (files.length === 0) {
  console.log('No CSV files found in content/');
  process.exit(0);
}

console.log(`Found ${files.length} file(s): ${files.join(', ')}\n`);

for (const file of files) {
  const month = file.replace('.csv', '');
  console.log(`── ${month} ──`);
  try {
    execSync(`node scripts/sync-to-sheets.js ${month}`, {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch {
    console.error(`  ✗ Failed to sync ${month}. Stopping.`);
    process.exit(1);
  }
  console.log();
}

console.log('All months synced.');
