# Content Rules — Taiwanese Calendar Widget

This file is the authoritative spec for generating monthly vocabulary TSV files.
Read it fully before generating any content.

---

## Vocabulary Philosophy

This calendar is not a vocabulary-learning app. The goal is to help people **discover Taiwan through language**.

A good word should feel distinctly Taiwanese, interesting, memorable, visual, and rooted in daily life. Prefer words that make people say "Oh, what does that mean?" over words they already know.

### Priority order

**1. Taiwanese-specific vocabulary** — words that exist in Taiwanese but not (or differently) in Mandarin.
Examples: 歹勢, 古意, 緣投, 食老, 膨風, 無採, 厚話, 四秀仔

**2. Taiwan seasonal vocabulary** — words tied to Taiwan's physical environment.
Examples: 火金姑, 月娘, 西北雨, 榕樹跤, 鳥仔聲, 海風, 溪仔

**3. Taiwan daily-life vocabulary** — concrete objects and scenes from everyday Taiwanese life.
Examples: 月台, 火車, 菜市仔, 埕仔, 書冊

**Avoid** abstract concepts without strong cultural grounding: 希望, 成功, 努力, 快樂, 夢想, 青春, 回憶, 等待.
Prefer concrete images over abstract emotions.

### Writing aesthetic

The calendar should feel like: a Taiwanese tear-off calendar, a notebook carried on a train, a summer evening in Taiwan, a memory from everyday life. Draw from Taiwanese literature, poetry, and song.

Sentences must be:
- Warm, specific, observational, quietly beautiful
- A small scene or captured emotion — not a usage demonstration

Sentences must never sound like:
- A dictionary, school textbook, language-learning app, motivational poster, or marketing copy

**The sentence creates an image. It does not teach a lesson.**

### month_theme vs theme

`month_theme` sets the single seasonal chapter for the whole month (e.g. `盛夏`). Do not split a month into sub-phases using `month_theme`. The month should feel like one cohesive chapter.

`theme` is the micro-topic for that specific word. Sub-themes (海風, 西北雨, 午後雷陣雨, 田埂, 溪仔, 月娘, 鳥仔聲, 火金姑, 颱風欲來進前的天氣, etc.) belong here, appearing naturally as the vocabulary warrants — not as a forced structural pattern.

---

## File Location and Naming

- One file per month: `content/YYYY-MM.csv`
- Comma-separated values, UTF-8, Unix line endings (`\n`)
- Fields must not contain literal ASCII commas (full-width Chinese commas `，` are fine)
- First row is the header — copy it exactly:

```
id,date,word_hanji,word_tailo,word_description,sentence_hanji,sentence_zh,season,month_theme,theme,source
```

---

## Column Reference

| Column | Type | Rules |
|---|---|---|
| `id` | integer | Sequential across all months. Check the last id in the existing files and continue from there. |
| `date` | string | `YYYY-MM-DD` format. One row per calendar day. No gaps, no duplicates. |
| `word_hanji` | string | Taiwanese vocabulary word in Traditional Chinese characters (漢字). 2–5 characters. |
| `word_tailo` | string | Tâi-lô (台羅拼音) romanization. See Tâi-lô rules below. |
| `word_description` | string | Definition in Mandarin Chinese (華語). End with `。`. 10–30 characters. |
| `sentence_hanji` | string | Example sentence in Taiwanese (台語漢字). End with `。`. Natural, colloquial speech. |
| `sentence_zh` | string | Mandarin translation of the sentence. End with `。`. |
| `season` | string | English snake_case. One of: `spring` `summer` `autumn` `winter` |
| `month_theme` | string | English slug. The overarching theme for the month (e.g. `graduation`, `midsummer`, `harvest`). Single theme per month — no phase splits. |
| `theme` | string | English category tag. Broad taxonomy matching the style of existing data: `nature`, `weather`, `place`, `object`, `feeling`, `people`, `travel`, `food`, `daily_life`, `night`. Add new tags only when none of these fit. |
| `source` | string | Leave empty. Reserved for future attribution. |

---

## Tâi-lô Romanization Rules

Pronunciations use **Tâi-lô (台羅拼音)**. This is mandatory — do not use Pe̍h-ōe-jī (POJ) or any other system.

### Tone diacritics

Tâi-lô uses Unicode combining diacritical marks on vowels. Always use the actual Unicode character, never an ASCII approximation.

| Tone | Mark | Example |
|---|---|---|
| 1st (flat) | none | `ping` |
| 2nd (rising) | ́ (U+0301) | `bí` |
| 3rd (falling) | ̀ (U+0300) | `bì` |
| 4th (stopped) | none (with final -p/-t/-k/-h) | `ba̍k` |
| 5th (low rising) | ̂ (U+0302) | `bô` |
| 6th (low flat) | — (rarely used) | |
| 7th (high flat) | ̄ (U+0304) | `bā` |
| 8th (stopped rising) | ̍ (U+030D) | `ba̍k` |

### Syllable separator

Use `-` (hyphen) to separate syllables in polysyllabic words: `Ki-á-ping`, `Sai-pak-hōo`.

### Capitalization

Capitalize the first syllable only: `Ki-á-ping`, not `Ki-Á-Ping`.

### Common reference examples from existing data

```
枝仔冰   Ki-á-ping
西北雨   Sai-pak-hōo
赤炎炎   Tshiah-iām-iām
颱風     Thai-hong
落雨     Lo̍h-hōo
海墘     Hái-kînn
歇涼     Hioh-liâng
檨仔     Suāinn-á
蟬仔聲   Siân-á-siann
火金姑   Hué-kim-koo
月娘     Gue̍h-niû
食老     Tsia̍h-lāu
```

---

## Content Quality Rules

### Word selection
- Words must be **authentic Taiwanese (台語)** vocabulary — not Mandarin words that happen to be written in Chinese characters.
- Prefer everyday words that evoke lived experience: nature, food, weather, family, body, time, emotions, village life.
- Avoid abstract, literary, or overly formal words.
- Words should feel like something a grandmother or a farmer would say naturally.

### Sentence rules
- The `sentence_hanji` must be written in natural **spoken Taiwanese** (台語漢字), not Mandarin written with Taiwanese pronunciation.
- Sentences should be short (15–30 characters) and feel like a real moment from daily life.
- Each sentence should paint a small scene or capture an emotion — not just use the word in a bland definition sentence.
- Avoid translating Mandarin sentences into Taiwanese word-for-word. Write the Taiwanese sentence first, then translate to Mandarin.
- End with `。`.

### Explanation rules
- `word_explanation` is in Mandarin (華語), written for a reader who doesn't know Taiwanese.
- It's a definition, not a usage example — keep it concise and factual.
- End with `。`.

### Theme rules
- `month_theme` gives the reader a sense of seasonal progression. For a given month, use 1–2 themes maximum (e.g. a month might start `初夏` and shift to `盛夏`).
- `theme` is the micro-topic of the specific word. Be specific: `颱風季` not just `夏天`, `水果` not just `食物`.
- Themes should vary across the month — avoid repeating the same `theme` more than 3 days in a row.

### Punctuation — full-width only (重要)
All punctuation inside the text fields (`word_description`, `sentence_hanji`, `sentence_zh`) **must be full-width (全形) CJK punctuation**. Never use half-width (半形 / ASCII) punctuation in these fields.

This is not just a style choice — a half-width comma `,` is the CSV field separator, so an ASCII comma inside a value **splits the row into the wrong number of columns and corrupts the data**.

| Use (全形) | Never (半形) |
|---|---|
| `，` | `,` |
| `。` | `.` |
| `；` | `;` |
| `：` | `:` |
| `！` | `!` |
| `？` | `?` |
| `（ ）` | `( )` |
| `「 」` | `" "` |

The only ASCII characters that legitimately appear in a row are the **field-separator commas** between the 11 columns, the hyphens in `date` (`2026-09-30`) and `word_tailo` (`Sūn-hong`), and the underscores in `season` / `month_theme` / `theme` tokens. Everything inside the three text fields is full-width.

To audit an existing file, every data row must have exactly **11 columns**:
```bash
awk -F',' 'NR>1 && NF!=11 {print FILENAME": line "NR" has "NF" columns"}' content/*.csv
```

---

## Season Assignment

| Month | Season |
|---|---|
| 3, 4, 5 | `spring` |
| 6, 7, 8 | `summer` |
| 9, 10, 11 | `autumn` |
| 12, 1, 2 | `winter` |

---

## ID Continuity

The `id` column is a global sequential counter across all months.

Before generating a new month, check the last `id` in the most recently generated CSV file and start from `last_id + 1`.

Current known ranges:
- `data/Taiwanese Calendar - June.csv`: id 1–30 (June 2026)
- `content/2026-07.csv`: id 31–61 (July 2026)
- `content/2026-08.csv`: id 62–92 (August 2026)

When generating a complete month, start id from `93`.

---

## Validation Checklist

Before saving a CSV, verify:

- [ ] Exactly one row per calendar day (no gaps, no duplicates)
- [ ] All `date` values are in `YYYY-MM-DD` format and belong to the target month
- [ ] All `word_tailo` use real Tâi-lô with Unicode diacritics (not ASCII approximations)
- [ ] All `word_description`, `sentence_hanji`, `sentence_zh` end with `。`
- [ ] `season` is the correct English slug for the month
- [ ] `month_theme` is a single English slug (no phase splits)
- [ ] `theme` values are English category tags
- [ ] `id` values are sequential and continue from the previous file
- [ ] All punctuation in `word_description` / `sentence_hanji` / `sentence_zh` is full-width (全形) — no half-width `, . ; : ! ? ( )` (see Punctuation rule)
- [ ] Every data row has exactly 11 columns (`awk -F',' 'NR>1 && NF!=11'` finds none)
- [ ] File encoding is UTF-8
