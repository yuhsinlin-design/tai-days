# Google Sheets Sync — Setup Guide

## 1. Create a Google Cloud project & enable the API

1. Go to https://console.cloud.google.com/
2. Create a new project (or pick an existing one).
3. In the left menu: **APIs & Services → Library**
4. Search for **Google Sheets API** → Enable it.

---

## 2. Create a service account

1. **APIs & Services → Credentials → Create Credentials → Service account**
2. Name it anything (e.g. `calendar-sync`). Click **Done**.
3. Click the service account you just created → **Keys** tab → **Add Key → Create new key → JSON**.
4. A JSON file downloads automatically. Move it to:
   ```
   calendar/credentials/service-account.json
   ```
   (The `credentials/` folder is git-ignored — never commit this file.)

---

## 3. Share your Google Sheet with the service account

1. Open your Google Sheet.
2. Click **Share**.
3. Paste the service account email (looks like `calendar-sync@your-project.iam.gserviceaccount.com`).
4. Grant **Editor** access. Click **Send**.

---

## 4. Get the spreadsheet ID

From the sheet URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```
Copy the `SPREADSHEET_ID` part.

---

## 5. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./credentials/service-account.json
```

---

## 6. Install dependencies & run

```bash
npm install
npm run sync 2026-06
```

The script will:
- Read `content/2026-06.tsv`
- Write the header row if the sheet tab is empty
- Append only rows whose `date` value is not already in the sheet (safe to re-run)

---

## Tab name

The script writes to a tab named **`calendar`**. Create this tab in your Google Sheet before running, or rename the default "Sheet1" tab to "calendar".

---

## Re-running safely

The sync is **idempotent** — rows already present (matched by the `date` column) are skipped. You can run it multiple times without creating duplicates.
