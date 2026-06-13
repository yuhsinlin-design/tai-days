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

// public/data is the version-controlled source of truth (dev server reads it
// over HTTP). resources/data is a derived mirror, regenerated here and bundled
// into the packaged Electron app via extraResources — it is gitignored.
const PUBLIC_DATA = path.join(ROOT, 'public', 'data');
const RESOURCES_DATA = path.join(ROOT, 'resources', 'data');
const AUDIO_DIR = path.join(PUBLIC_DATA, 'audio');

const OUTPUT_PATHS = [
  path.join(PUBLIC_DATA, 'calendar.json'),
  path.join(RESOURCES_DATA, 'calendar.json'),
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

// Mirror the audio assets from public/data/audio into resources/data/audio so
// the packaged app ships them. Only copies what changed (size differs / missing).
const srcAudio = AUDIO_DIR;
const destAudio = path.join(RESOURCES_DATA, 'audio');
if (fs.existsSync(srcAudio)) {
  fs.mkdirSync(destAudio, { recursive: true });
  let copied = 0;
  for (const file of fs.readdirSync(srcAudio)) {
    if (!file.endsWith('.mp3')) continue;
    const from = path.join(srcAudio, file);
    const to = path.join(destAudio, file);
    if (!fs.existsSync(to) || fs.statSync(to).size !== fs.statSync(from).size) {
      fs.copyFileSync(from, to);
      copied++;
    }
  }
  console.log(`✓ Mirrored audio → ${path.relative(ROOT, destAudio)} (${copied} updated)`);
}
