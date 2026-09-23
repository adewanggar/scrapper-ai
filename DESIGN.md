# Design.md — TikTok Comments Explorer (Light Theme)

Design tokens and component specs extracted from the light-theme reference screenshot. Use this as the source of truth when converting the current dark UI to this light theme. Preserve all existing layout structure, data, and functionality — this is a **visual re-skin**, not a redesign of the information architecture.

---

## 1. Color Tokens

```css
:root {
  /* Base surfaces */
  --color-bg: #FAFAFA;              /* page background */
  --color-surface: #FFFFFF;         /* cards, inputs, header */
  --color-border: #E5E7EB;          /* default hairline border */
  --color-border-strong: #D1D5DB;   /* input borders */

  /* Text */
  --color-text-primary: #111827;    /* headings, usernames, body */
  --color-text-secondary: #6B7280;  /* subtitles, meta, labels */
  --color-text-muted: #9CA3AF;      /* placeholders, timestamps, "no replies" */

  /* Brand / primary action */
  --color-primary: #2563EB;         /* active tab, checked checkbox, links */
  --color-primary-bg: #EFF6FF;

  /* CTA gradient — "Scrape Video Baru" */
  --gradient-cta: linear-gradient(135deg, #FB923C 0%, #F97316 100%);

  /* Status */
  --color-success: #16A34A;
  --color-success-bg: #DCFCE7;      /* "API Online" badge */

  /* Caption card (warm highlight) */
  --color-caption-bg: #FFF9EB;
  --color-caption-accent: #2563EB;  /* "CAPTION VIDEO TIKTOK" label */

  /* "Buka di TikTok" pill */
  --color-tiktok-pill-bg: #FEF2F2;
  --color-tiktok-pill-text: #DC2626;

  /* Stat-card accent backgrounds (each stat gets its own pastel) */
  --stat-blue-bg: #DBEAFE;   --stat-blue-icon: #2563EB;   /* Komentar Utama */
  --stat-rose-bg: #FEE2E2;   --stat-rose-icon: #DC2626;   /* Total Balasan */
  --stat-violet-bg: #EDE9FE; --stat-violet-icon: #7C3AED; /* Partisipan Unik */
  --stat-amber-bg: #FEF3C7;  --stat-amber-icon: #D97706;  /* Hasil Terfilter */

  /* Tag / keyword pills */
  --color-pill-bg: #F3F4F6;
  --color-pill-bg-hover: #E5E7EB;
  --color-pill-text: #374151;

  /* Shadows */
  --shadow-card: 0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06);
  --shadow-header: 0 1px 0 rgba(16, 24, 40, 0.04);
}
```

**Rule:** every stat card, badge, and the caption card each carry their *own* named pastel — do not reuse one generic "card gray" for all of them. That color-coding is what reads as organized/scannable rather than flat.

---

## 2. Typography

- **Family:** Inter (or system-ui fallback stack: `-apple-system, "Segoe UI", Inter, sans-serif`). Same family for everything — no serif/display pairing needed here; this is a data tool, not editorial content.
- **Scale:**
  | Role | Size | Weight | Color |
  |---|---|---|---|
  | App title ("TikTok Comments Explorer") | 18px | 600 | `--color-text-primary` |
  | Subtitle | 13px | 400 | `--color-text-secondary` |
  | Stat number | 24px | 700 | `--color-text-primary` |
  | Stat label | 12px | 500 | `--color-text-secondary` |
  | Section label ("CAPTION VIDEO TIKTOK") | 11px | 700, letter-spacing 0.04em | `--color-primary` |
  | Caption body | 14px | 400, line-height 1.6 | `--color-text-primary` |
  | Username | 14px | 600 | `--color-text-primary` |
  | Comment body | 14px | 400 | `#1F2937` |
  | Timestamp / meta | 12px | 400 | `--color-text-muted` |
  | Pill / tag text | 13px | 500 | `--color-pill-text` |

Avoid all-caps for anything except the two small section eyebrows already present in the source (`CAPTION VIDEO TIKTOK`, `KATA KUNCI TERPOPULER`) — don't introduce new ones.

---

## 3. Layout & Spacing

- Page padding: 24px on desktop, 16px on mobile.
- Card border-radius: **14px** for large containers (header, caption card, search panel, comment list), **10px** for stat cards and buttons, **999px** (full pill) for tags/badges/filter-tabs.
- Vertical rhythm between major sections: 20px.
- Stat-card grid: 4 columns, 16px gap, equal width, each `padding: 20px`.
- Card borders: 1px solid `--color-border` on white cards sitting on the `--color-bg` page (the border is what separates white-on-off-white, since shadows are very subtle).

---

## 4. Components

### 4.1 Header bar
- White surface, bottom hairline border (`--shadow-header`), no heavy shadow.
- Left: square TikTok icon (black rounded-square, 40px) + title + subtitle stacked.
- Right, in order: **Pengaturan** (settings) — ghost button, gray bg `#F3F4F6`, icon + label; **API Online** badge — pill, `--color-success-bg` bg, green dot + `--color-success` text; **Upload JSON** — white bg, `--color-border-strong` border, icon + label; **Scrape Video Baru** — primary CTA, `--gradient-cta` background, white text, play icon, subtle shadow, rounded-full or 10px radius.

### 4.2 Video selector row
- White bordered input-like bar (full width) with file icon + "Pilih Data Video" label + selected filename, chevron on the right.
- **Refresh** button to its right: white bg, gray border, icon + label.

### 4.3 Caption card
- Background `--color-caption-bg` (warm cream), 14px radius, padding 20px.
- Top-left: eyebrow label `CAPTION VIDEO TIKTOK` in `--color-primary`, bold, tracked.
- Top-right: **Buka di TikTok** pill button, `--color-tiktok-pill-bg` bg, `--color-tiktok-pill-text` text + icon.
- Body: caption paragraph text, hashtags and code inline (no special styling needed beyond body text color).
- Far right: video thumbnail (rounded 10px, ~110×110px), centered white play-circle overlay, duration pill (dark translucent, bottom-left of thumbnail, white text), and a small "324 komentar" caption underneath in `--color-text-muted`.

### 4.4 Stat cards (× 4)
- Each: pastel background per §1, 10px radius, padding 16px, icon in a small rounded-square chip (white or slightly darker tint of its own pastel) at top-left, number below (large/bold), label below that (small/gray).
- No border needed — the pastel fill itself provides the separation from the page background.

### 4.5 Search & filter panel
- White card, 14px radius, border, padding 20px.
- Row 1: search input (full width, rounded-lg, gray border, left search icon, gray placeholder) + sort dropdown (right, bordered, "Urutkan: Terbaru").
- Row 2: "Cari Di:" label + filter tabs — **Semua** active (solid `--color-primary` bg, white text, full pill), **Komentar Saja** / **Balasan Saja** inactive (white bg, gray border, gray text, full pill) — plus two checkboxes on the right ("Hanya yang punya balasan", "Case sensitive (Aa)"), blue check when active, white/bordered when off.
- Row 3: keyword section — small fire-emoji eyebrow `KATA KUNCI TERPOPULER (KLIK UNTUK MEMFILTER)`, then a wrapped row of pill tags (`--color-pill-bg`, dark text, count number in slightly muted weight), hover state `--color-pill-bg-hover`.

### 4.6 Comment list
- Section header row: bold "Daftar Komentar (n dari n komentar)" left; **Ekspor CSV** / **Ekspor JSON** ghost buttons (white, bordered, icon + label) right.
- Each comment row: circular avatar (40px) left; username (bold) + optional handle (gray, smaller) on one line, timestamp with small clock icon right-aligned; comment body below at full width; "Tidak ada balasan" or reply count in muted italic-weight small text; copy/more icons top-right of the row, gray, appearing subtle (not boxed).
- Rows separated by a 1px hairline (`--color-border`) rather than individual card shadows — keeps a long list feeling light, not like a stack of boxes.

---

## 5. What changes vs. the dark version

| Dark version | Light version |
|---|---|
| Near-black page bg, dark card fills | White/`#FAFAFA` page, white cards with hairline borders |
| Glow/neon accent borders on stat icons | Flat pastel fills per stat, no glow |
| Pink/red gradient CTA | Orange→coral gradient CTA (`--gradient-cta`) |
| Caption card same dark tone as page | Caption card gets its own warm cream tint + adds a video thumbnail preview (not present in dark version) |
| Low-contrast dark tag pills | Light gray pills, dark text, higher legibility |
| Comments rendered as-is on dark bg | Comments get avatar art (colored placeholder icons/emoji) and slightly more breathing room |

---

## 6. Accessibility / quality floor
- Maintain 4.5:1 contrast for body text on all pastel backgrounds (test `--stat-*-icon` colors against their `-bg` pair).
- Keep visible keyboard focus rings (2px `--color-primary` outline) on all interactive elements — buttons, tabs, checkboxes, pills.
- Respect `prefers-reduced-motion` for any hover/transition animation on pills and buttons.
- Responsive: stat-card grid collapses to 2 columns at `<768px`, 1 column at `<420px`; header CTAs wrap or collapse to icon-only below `768px`.