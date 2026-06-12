# Design System

This document describes the visual and interaction design of the Taiwanese Calendar Widget. Treat everything here as the canonical, finalized specification. Do not redesign.

---

## Canvas

| Property | Value |
|---|---|
| Width | 320px |
| Height | 320px |
| Border radius | 20px |
| Background | `#fcfbf8` (warm off-white) |
| Overflow | hidden |

---

## Colors

| Token | Hex | Usage |
|---|---|---|
| `weekday` | `#0036C7` | Date number, weekday label, decorative lines — Mon–Fri |
| `weekend` | `#C70000` | Same elements — Sat & Sun |
| Header | `#fb5f0f` | Orange handle bar |
| Card background | `#ffffff` | VocabCard fill |
| Card border | `#000000` | VocabCard border |
| Tag border | `#000000` | 詞/音/義/句 tag borders |
| Translation text | `#606060` | Sentence translation (small, below sentence) |
| Page background | `#fcfbf8` | Same as canvas |

**Color rule:** `isWeekend(date)` returns true for `getDay() === 0` (Sunday) or `getDay() === 6` (Saturday). All other days are weekday color.

---

## Typography

**Font:** Noto Sans TC only (loaded from Google Fonts, weights 400 and 700).
No other typefaces. `font-sans` and `font-work` in Tailwind both resolve to Noto Sans TC.

| Element | Size | Weight |
|---|---|---|
| Header year | 8px | 700 |
| Header month (zh + en) | 8px | 700 |
| Lunar badge | 8px | 700 |
| Date number | 72px | 700 |
| Weekday label | 18px | 700 |
| VocabCard tag labels (詞/音/義/句) | 10px | 700 |
| VocabCard word / meaning / sentence | 10px | 400 |
| VocabCard pronunciation | 10px | 400 |
| VocabCard translation | 8px | 400 |

---

## Layout Zones

### Header (z-index 20)
- Height: 28px
- Full width: 320px
- Background: `#fb5f0f`
- Contains: year (left), two pin circles (center), month zh + en (right)
- Class `.drag-region` enables `-webkit-app-region: drag` for Electron window dragging

### Pin row (z-index 21)
- Two 12×12px white circles, `box-shadow: 0 2px 4px rgba(0,0,0,0.12)`
- Centered horizontally, `top: 8`, 84px apart
- `pointer-events: none`

### Page area
- `top: 28, left: 0, width: 320, height: 292`
- `overflow: hidden`

### Date zone (within page area)
- `top: 0, left: 0, width: 320, height: 152`
- Contents vertically and horizontally centered
- Contains: `DateSection` component

### VocabCard zone (within page area)
- `top: 152, left: 12, width: 296`
- Contains: `VocabCard` component

---

## Background Texture

Applied to every `CalendarPage` (both current and next):
- Image: `/assets/bg.png`
- `mix-blend-mode: luminosity`
- `opacity: 0.35`
- Covers full page area, `object-fit: cover`
- `pointer-events: none`

The same texture is applied to the curl face at the same opacity and blend mode.

---

## Fruit Decorations

Three mangoes are placed on every `CalendarPage`. Their positions are **manually tuned by the designer** — do not adjust any of these numbers.

### Mango 3 (right-top)
- Container: `left: 216, top: 12, width: 80, height: 80`
- Inner transform: `rotate(90deg)`
- Image scale: `width: 134.84%, height: 134.84%`, `left: -16.13%, top: -16.13%`
- Asset: `/assets/mango3.png`

### Mango 2 (left-center)
- Container: `left: 32, top: 104, width: 60, height: 60`, `overflow: hidden`
- Image scale: `width: 131.17%, height: 131.17%`, `left: -17.99%, top: -15.54%`
- Asset: `/assets/mango2.png`

### Mango 1 (bottom-right)
- Container: `left: calc(50% + 82.5px), top: calc(50% + 138.5px), width: 73, height: 69`
- `transform: translate(-50%, -50%)`
- Image scale: `width: 150.9%, height: 159.95%`, `left: -25.27%, top: -32.02%`
- Asset: `/assets/mango1.png`

All fruit containers have `pointer-events: none` and `overflow: hidden`.

---

## DateSection Component

```
┌─────────────────────┐
│  [ 四月廿四 ]        │  ← lunar badge: border, rounded-full, 8px bold
│                     │
│        09           │  ← 72px bold, weekday color
│   — 星期二 —        │  ← 18px bold + 24px colored lines left/right
└─────────────────────┘
```

- The entire block is `flex-col items-center`, gap 4px
- Lunar badge: `border border-black rounded-[1000px]`, padding `2px 4px`
- Decorative lines: 24px wide, 1px tall, same color as date

---

## VocabCard Component

Three rows separated by `border-t border-black`:

| Row | Tag | Content |
|---|---|---|
| 1a | 詞 | Word (台語 word) |
| 1b | 音 | Romanized pronunciation + sound icon |
| 2 | 義 | Meaning in Mandarin |
| 3 | 句 | Example sentence + sound icon + Mandarin translation below |

- Root: `bg-white border-2 border-black rounded-[12px] overflow-hidden`
- Row padding: 8px all sides
- Tag circles: 16×16px, `border border-black rounded-[100px]`, 10px bold text
- Sound icon: `/assets/sound-icon.svg`, 12×12px inside a 16×16px container

---

## Page Peel Interaction — Finalized

This interaction is finalized. Preserve it exactly.

### States

**Default (no hover):**
- Page is completely flat
- No curl visible anywhere
- Next page is rendered underneath at z-index 0 but fully hidden

**Hover (mouse enters bottom-right 60×60px hotspot):**
- Current page `clip-path` transitions from `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)` to `polygon(0% 0%, 100% 0%, 100% 69.178%, 81.25% 100%, 0% 100%)`
- Curl div grows from `0×0` to `60×60px` at bottom-right corner
- Both transitions: `0.4s ease`
- Curl visual: `linear-gradient(135deg, #ffffff → #f3f3f3 → #bbbbbb → #aaaaaa → #888888 → rgba shadow)`
- Curl has `border-radius: 20px 0 0 0` (free corner rounded)
- Curl has bg texture overlay (same as page: `/assets/bg.png`, luminosity, 0.35 opacity)
- Box shadow: `0 0 8px rgba(0,0,0,0.18)`
- The next day's content is visible in the clipped corner

**Click:**
- `dayOffset` increments by 1
- Current page exits: `x: -90, opacity: 0, rotate: -2` over 200ms
- New page enters: `x: 56 → 0, opacity: 0 → 1` over 240ms
- Hover state resets; curl collapses
- A `useRef` (`flippingRef`) locks out additional clicks for 420ms to prevent multi-skip

### z-index Stack (within page area)

| z-index | Layer |
|---|---|
| 0 | Next page (always rendered) |
| 1 | Current page (`motion.div` wrapper) |
| — | Inner clip-path div (no z-index, child of z:1) |
| 3 | Curl triangle div |
| 10 | Invisible hotspot div |

### Key Constants

```ts
const FOLD = 60          // curl size and hotspot size in px
const PAGE_W = 320
const PAGE_H = 292
const FOLD_RIGHT_Y  = PAGE_H - FOLD   // 232 — fold line on right edge
const FOLD_BOTTOM_X = PAGE_W - FOLD   // 260 — fold line on bottom edge
```

### Why clip-path is on an inner div
Framer Motion controls `transform` and `opacity` on the `motion.div`. Placing `clip-path` on the same element creates conflicts where CSS `transition` is ignored. The solution: outer `motion.div` handles Framer Motion values only; an inner plain `<div>` handles `clip-path` via CSS transition.

### Why flippingRef is a useRef
Using `useState(flipping)` caused stale closure bugs — two rapid clicks would both see `flipping = false` before the state update re-rendered. A `useRef` is synchronously up to date across all closures.

---

## Animation Timing Reference

| Animation | Duration | Easing |
|---|---|---|
| Page enter (x + opacity) | 240ms | `[0.25, 0.46, 0.45, 0.94]` |
| Page exit (x + opacity + rotate) | 200ms | `[0.4, 0, 0.6, 1]` |
| Clip-path peel | 400ms | `ease` |
| Curl grow | 400ms | `ease` |
| Flip lock duration | 420ms | — |

---

## Per-Month Theme Tokens

Each month defines its own fruit illustration and header colors in its theme file (`src/themes/<month>.ts`). Use `#000000` header text for months with pale/bright backgrounds (3月, 9月); `#ffffff` for all others.

| Month | Fruit | `header-bg` | `header-text` |
|---|---|---|---|
| 1月 | 火龍果 Dragon fruit | `#E82070` | `#ffffff` |
| 2月 | 草莓 Strawberry | `#F04878` | `#ffffff` |
| 3月 | 鳳梨 Pineapple | `#F5C800` | `#000000` |
| 4月 | 芭樂 Guava | `#4A9030` | `#ffffff` |
| 5月 | 桑椹 Mulberry | `#8C20A0` | `#ffffff` |
| 6月 | 荔枝 Lychee | `#DF3031` | `#ffffff` |
| 7月 | 芒果 Mango | `#FB5F0F` | `#ffffff` |
| 8月 | 西瓜 Watermelon | `#1C4A20` | `#ffffff` |
| 9月 | 文旦 Pomelo | `#D8EC25` | `#000000` |
| 10月 | 柿子 Persimmon | `#C85A1E` | `#ffffff` |
| 11月 | 蓮霧 Wax Apple | `#B82058` | `#ffffff` |
| 12月 | 葡萄 Grape | `#4A2090` | `#ffffff` |

---

## Figma Variable Structure

For designers reproducing this widget in Figma. Per-month overrides live in a separate **Monthly Theme** collection with two modes (Dark header / Light header); switch to Light header when the background is pale/bright (March, September).

```
Variables
├── Color
│   ├── page-bg          #fcfbf8
│   ├── weekday          #0036C7
│   ├── weekend          #C70000
│   ├── card-bg          #ffffff
│   ├── card-border      #000000
│   ├── translation      #606060
│   └── text             #000000
│
├── Spacing
│   ├── widget-radius    20
│   ├── card-radius      12
│   ├── tag-radius       100
│   ├── header-h         28
│   ├── card-left        12
│   ├── card-width       296
│   ├── date-zone-h      152
│   └── row-padding      8
│
└── Typography
    ├── size-header      8
    ├── size-tag         10
    ├── size-vocab       10
    ├── size-translation 8
    ├── size-weekday     18
    └── size-day         72
```
