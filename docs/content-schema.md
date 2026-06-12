# Content Schema

This document defines the data structures and content rules for the Taiwanese Calendar Widget.

---

## Vocabulary Data File

**Location (dev/browser):** `public/data/calendar.json`
**Location (Electron production):** `resources/data/calendar.json`

Loaded at startup:
- In Electron: via `ipcMain.handle('read-calendar-data')` → `electronAPI.readCalendarData()`
- In browser: `fetch('/data/calendar.json')`

---

## Entry Schema

Each entry in `calendar.json` is a JSON object:

```json
{
  "year": 2026,
  "month": 6,
  "day": 9,
  "word": "熱天",
  "pronunciation": "Juah-thinn",
  "meaning": "夏天、炎熱的季節。",
  "sentence": "熱天到了，愛注意中暑。",
  "translation": "夏天到了，要注意中暑。"
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `year` | number | Gregorian year (e.g. `2026`) |
| `month` | number | Gregorian month, 1–12 (not zero-indexed) |
| `day` | number | Gregorian day of month |
| `word` | string | Taiwanese (台語) vocabulary word in Traditional Chinese characters |
| `pronunciation` | string | Romanized pronunciation using Tâi-lô (台羅拼音) |
| `meaning` | string | Definition in Mandarin Chinese, ending with `。` |
| `sentence` | string | Example sentence in Taiwanese (台語 characters), ending with `。` |
| `translation` | string | Mandarin translation of the sentence, ending with `。` |

### Fields NOT in the JSON but computed at runtime (not stored)

| Field | Source |
|---|---|
| `lunar` | Computed from `lunar-javascript` → `Lunar.fromDate(d)` |
| `weekday` | Computed from `date.getDay()` mapped to `WEEKDAYS` array |
| `monthZh` | Computed from `date.getMonth()` mapped to `MONTHS_ZH` array |
| `monthEn` | Computed from `date.getMonth()` mapped to `MONTHS_EN` array |
| `color` | Derived from `isWeekend(date)` → `COLORS.weekday` or `COLORS.weekend` |

---

## Entry Lookup

Matching logic in `App.tsx`:

```ts
const findEntry = (info) =>
  data.find(d => d.month === info.month && d.day === info.day) ?? data[0]
```

- Matches on `month` AND `day` only (year is ignored at lookup time)
- If no match found, falls back to `data[0]`
- The `year` field in JSON is informational — it has no effect on lookup

---

## Lunar Date Format

The lunar date string displayed in the badge is constructed as:

```ts
(isLeap ? '閏' : '') + lunar.getMonthInChinese() + '月' + lunar.getDayInChinese()
```

Examples: `四月廿四`, `閏四月初一`

Leap months (`lunar.getMonth() < 0`) are prefixed with `閏`.

---

## Pronunciation Encoding

Pronunciations use **Tâi-lô (台羅拼音)** romanization. This system uses Unicode combining diacritical marks for tones. All text must be stored as valid UTF-8.

Common characters to watch for:
- Tone marks: ̍ (U+030D), ̂ (U+0302), ̄ (U+0304), ̀ (U+0300), ́ (U+0301), ̃ (U+0303), ̈ (U+0308)
- These appear on vowels: `Ji̍t-thâu`, `Gue̍h-niû`, `Lo̍h-hōo`

The font (Noto Sans TC) supports these combining marks. Do not replace them with ASCII approximations.

---

## VocabCard Fallback Values

When no entry matches the current date:

| Field | Fallback |
|---|---|
| `word` | `'—'` |
| `pronunciation` | `''` (empty) |
| `meaning` | `'尚無資料'` |
| `sentence` | `''` (empty) |
| `translation` | `''` (empty) |

---

## Date Logic

### Gregorian date with offset

```ts
function getDateForOffset(offset: number) {
  const d = new Date()         // today at runtime
  d.setDate(d.getDate() + offset)
  // ...
}
```

- `offset = 0` → today (current page)
- `offset = 1` → tomorrow (next page, shown under the peel)
- `dayOffset` state starts at 0 and increments by 1 on each page flip

### Month and weekday label arrays

```ts
const MONTHS_ZH = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
const MONTHS_EN = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
const WEEKDAYS  = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
```

Index follows JavaScript's `Date.getDay()` and `Date.getMonth()` conventions (getDay: 0=Sunday, getMonth: 0=January).

---

## Adding New Vocabulary Entries

1. Add a new object to `public/data/calendar.json`
2. Fields `year`, `month`, `day` must be set correctly (month is 1-indexed)
3. Ensure `pronunciation` uses valid UTF-8 Tâi-lô characters
4. `meaning` and `translation` should end with `。`
5. Duplicate month+day entries: the first match in the array wins (`Array.find` stops at the first match)
6. In production Electron builds, also update `resources/data/calendar.json`

---

## Header Date Display

The `Header` component receives `year`, `monthZh`, `monthEn` from `currInfo` (offset 0). These always reflect the currently displayed day, not system clock directly — after page flips, they advance with `dayOffset`.
