#!/usr/bin/env node
/**
 * Reads all content/YYYY-MM.csv files and writes calendar.json
 * to both public/data/ (dev) and resources/data/ (Electron production).
 *
 * Usage:
 *   npm run build:data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const AUDIO_DIR = path.join(ROOT, 'public', 'data', 'audio');

const OUTPUT_PATHS = [
  path.join(ROOT, 'public', 'data', 'calendar.json'),
  path.join(ROOT, 'resources', 'data', 'calendar.json'),
];

function parseCsvRows(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => line.split(','));
}

function rowToEntry(row) {
  const [, date, word_hanji, word_tailo, word_description,
    sentence_hanji, sentence_zh] = row;

  const [year, month, day] = date.split('-').map(Number);

  // Audio is downloaded per-date by scripts/download-audio.cjs; only words the
  // MOE dictionary has a recording for get a file, so null means "no audio".
  const audioFile = `${date}-word.mp3`;
  const audio = fs.existsSync(path.join(AUDIO_DIR, audioFile))
    ? `data/audio/${audioFile}`
    : null;

  return {
    year,
    month,
    day,
    word: word_hanji,
    pronunciation: word_tailo,
    meaning: word_description,
    sentence: sentence_hanji,
    translation: sentence_zh,
    audio,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = fs.readdirSync(CONTENT_DIR)
  .filter(f => /^\d{4}-\d{2}\.csv$/.test(f))
  .sort();

if (files.length === 0) {
  console.error('No CSV files found in content/');
  process.exit(1);
}

const entries = files.flatMap(f => {
  const rows = parseCsvRows(path.join(CONTENT_DIR, f));
  return rows.map(rowToEntry);
});

// Sort by date so the array is always in chronological order
entries.sort((a, b) => {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
});

const json = JSON.stringify(entries, null, 2);

for (const outPath of OUTPUT_PATHS) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, json, 'utf8');
  console.log(`✓ Written ${entries.length} entries → ${path.relative(ROOT, outPath)}`);
}
