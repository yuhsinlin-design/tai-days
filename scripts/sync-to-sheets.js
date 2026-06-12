#!/usr/bin/env node
/**
 * Reads /content/YYYY-MM.csv and appends new rows to the Google Sheet tab "calendar".
 *
 * Usage:
 *   node scripts/sync-to-sheets.js 2026-07
 *   node scripts/sync-to-sheets.js          ← defaults to current YYYY-MM
 *
 * Env vars (set in .env or exported in shell):
 *   GOOGLE_SERVICE_ACCOUNT_KEY_FILE  — path to the JSON key file (default: ./credentials/service-account.json)
 *   GOOGLE_SHEET_ID                  — the spreadsheet ID from the sheet URL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Config ────────────────────────────────────────────────────────────────────

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
  ?? path.join(ROOT, 'credentials', 'service-account.json');
const TAB_NAME = 'calendar';

const COLUMNS = [
  'id', 'date', 'word_hanji', 'word_tailo', 'word_description',
  'sentence_hanji', 'sentence_zh', 'season', 'month_theme', 'theme', 'source',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveMonth(arg) {
  if (arg) return arg;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function parseCsv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n').filter(l => l.trim());
  // Skip header row; split on comma — fields must not contain literal commas
  return lines.slice(1).map(line => line.split(','));
}

async function getExistingDates(sheets, spreadsheetId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TAB_NAME}!B2:B`,   // date column, skip header
  });
  return new Set((res.data.values ?? []).flat());
}

async function ensureHeaderRow(sheets, spreadsheetId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${TAB_NAME}!A1:K1`,
  });
  if ((res.data.values?.[0] ?? []).length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TAB_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [COLUMNS] },
    });
    console.log('  ✓ Header row written');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const month = resolveMonth(process.argv[2]);

  if (!SHEET_ID) {
    console.error('ERROR: GOOGLE_SHEET_ID is not set.\nAdd it to .env or export it in your shell.');
    process.exit(1);
  }

  const csvPath = path.join(ROOT, 'content', `${month}.csv`);
  if (!fs.existsSync(csvPath)) {
    console.error(`ERROR: CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(KEY_FILE)) {
    console.error(`ERROR: Service account key not found: ${KEY_FILE}`);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Syncing ${month}.csv → Sheet "${TAB_NAME}" …`);

  await ensureHeaderRow(sheets, SHEET_ID);

  const existingDates = await getExistingDates(sheets, SHEET_ID);
  const rows = parseCsv(csvPath);
  const newRows = rows.filter(r => !existingDates.has(r[1]));

  if (newRows.length === 0) {
    console.log('  Nothing to append — all dates already exist in the sheet.');
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${TAB_NAME}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: newRows },
  });

  console.log(`  ✓ Appended ${newRows.length} row(s) (skipped ${rows.length - newRows.length} duplicates)`);
}

main().catch(err => {
  console.error('FATAL:', err.message ?? err);
  process.exit(1);
});
