# Handoff — Personal Portfolio (Direction B · Dune Editorial)

## Overview
A minimal, editorial single-page portfolio inspired by Perry Wang's typographic restraint, with quiet "Dune" atmospherics (twin-sun horizon, drifting spice particles, animated terracotta accent). Built as a developer/engineer's site — work, blog, activity timeline, stack & colophon. Cream surface, ink type, terracotta accent.

## About the Design Files
The files bundled here (`redesign.html`, `direction-b-editorial.jsx`, `terminal-hero.jsx`) are **design references** — a high-fidelity HTML prototype produced inside a design canvas. They are NOT production code to copy verbatim.

Your job is to **recreate this design in the target codebase** (Astro 5 site, deployed to GitHub Pages — see "Target Stack" below). Use the codebase's existing component conventions where they exist, and add only what's needed.

## Fidelity
**High-fidelity.** Pixel-perfect: every color, font size, spacing, and animation in this brief is final. Recreate exactly. Where the prototype uses a single artboard column at 1280px width, your responsive implementation should preserve the desktop layout at ≥1024px and reflow gracefully below.

## Target Stack
- **Framework:** Astro 5 (existing repo)
- **Hosting:** GitHub Pages
- **Source:** Markdown content authored in Obsidian, synced into an Astro content collection
- **Fonts:** Inter (display + body), JetBrains Mono (code/chips)
  - Load via `@fontsource/inter` (weights 400, 500, 600) and `@fontsource/jetbrains-mono` (400)
- **No Tailwind required** — the prototype uses inline styles; reimplement as either scoped `<style>` blocks per Astro component, or a single global CSS file with BEM-ish classes. Pick one and be consistent.

---

## Design Tokens

```css
/* Colors */
--bg:        #f4efe6;  /* warm cream, page surface */
--bg-soft:   #ece6d9;  /* sub-bands (Currently strip, Colophon) */
--ink:       #1a1a1a;  /* primary text + monogram fill */
--ink-soft:  #2a2a2a;  /* secondary text */
--muted:     #7a7468;  /* tertiary text, eyebrows, meta */
--line:      #d8d0c0;  /* hairlines, borders */
--accent:    #c14a1a;  /* terracotta, animated cycle */
--sand-1:    #e8d9b8;  /* top dune */
--sand-2:    #d6bf8e;  /* mid dune */
--sand-3:    #b89760;  /* bottom dune */
--sun-1:     #e8623d;  /* small sun (terracotta) */
--sun-2:     #f0a040;  /* large sun (ochre) */

/* Type */
--font-sans:    "Inter", -apple-system, system-ui, sans-serif;
--font-display: "Inter", -apple-system, system-ui, sans-serif;
--font-mono:    "JetBrains Mono", "SF Mono", ui-monospace, monospace;

/* Page */
--page-pad-x: 48px;
--max-content: 1280px;
```

### Type scale
| Use | Family | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Hero H1 | Inter | clamp(48px, 6.5vw, 96px) | 500 | -0.04em | 1.05 |
| Section H2 (large) | Inter | clamp(40px, 4.6vw, 64px) | 500 | -0.03em | 1.05 |
| Section H2 (left rail) | Inter | 36px | 500 | -0.02em | 1.15 |
| Section H2 (small) | Inter | 22px | 500 | -0.01em | — |
| Featured post H3 | Inter | clamp(32px, 3.4vw, 44px) | 500 | -0.02em | 1.1 |
| Card title | Inter | 22px | 500 | -0.015em | 1.3 |
| Body large | Inter | 22px | 400 | — | 1.45 |
| Body | Inter | 17px | 400 | — | 1.5–1.65 |
| Meta | Inter | 13–14px | 400 | — | 1.5 |
| Eyebrow | Inter | 11px | 400 | 0.18em + UPPERCASE | — |
| Mono chip | JetBrains Mono | 11–14px | 400 | 0.02em | — |

### Animations (CSS keyframes)
```css
@keyframes duneAccentShift {
  0%   { color: #c14a1a; }
  33%  { color: #e8623d; }
  66%  { color: #b89760; }
  100% { color: #c14a1a; }
}
@keyframes duneShimmer {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes duneSunPulse {
  0%, 100% { opacity: 0.92; transform: translateY(0); }
  50%      { opacity: 1;    transform: translateY(-3px); }
}
@keyframes duneBirdDrift {
  0%   { transform: translateX(0); }
  100% { transform: translateX(280px); }
}
```
Helpers:
- `.dune-accent` — apply to inline brand mentions (e.g. "Vimeflow"). 8s cycle.
- `.dune-shimmer` — apply to inline phrase that should shimmer with a 5-stop horizontal gradient. Uses `background-clip: text; color: transparent`. 7s cycle.

---

## Page structure (top-to-bottom)

The page is one long single-column column at `width: 1280px max`, side padding `48px`. Sections are separated by `1px solid var(--line)` rules — never drop shadows. Sub-bands (Currently, Colophon) use `--bg-soft` instead of `--bg` to break rhythm; everything else is `--bg`.

### 1. Header (`<header>`, padding `36px 48px 0`)
3-column grid `1fr 1fr 1fr`, gap 32, `align-items: start`.

- **Left** — flex row, gap 14:
  - Circle monogram: 42×42, `border-radius: 50%`, `background: var(--ink)`, `color: var(--bg)`, content "W", Inter 600 / 18px / -0.02em, centered.
  - Text block:
    - Name: "Will Wang" — Inter 600 / 16px / -0.01em / line-height 1.2
    - Role: "Software Engineer" — Inter 400 / 13px / `var(--muted)` / 0.01em
- **Center** — column:
  - Eyebrow: "Main"
  - Nav row (gap 18, Inter 500 / 16px): `Work` (active, 1.5px ink underline, padding-bottom 1) · `Blog` (muted) · `Info` (muted)
- **Right** — column, text-align right:
  - Eyebrow: "Contact"
  - Nav row (justify end, gap 18): `GitHub` · `LinkedIn` · `Email` (all ink, no underline)

### 2. Hero (`<section>`, padding `180px 48px 140px`, min-height 760, `position: relative`, `overflow: hidden`)
Two atmosphere layers `position: absolute; inset: 0; pointer-events: none`, then content with `z-index: 2`.

**Layer A — TwinSunHorizon** (SVG, viewBox `0 0 1280 520`, `preserveAspectRatio="xMidYMax slice"`):
- `<defs>` two radial gradients:
  - `sunA`: 0% `#fff3d6 / 1`, 40% `#f0a040 / 0.9`, 100% `#f0a040 / 0`
  - `sunB`: 0% `#ffe0b8 / 0.95`, 40% `#e8623d / 0.7`, 100% `#e8623d / 0`
- Linear gradient `haze`: 0% `#f4efe6 / 0`, 100% `#e8c89a / 0.5`
- `<rect x=0 y=200 w=1280 h=320 fill="url(#haze)" />` atmospheric haze
- Sun A group (`animation: duneSunPulse 9s ease-in-out infinite`):
  - `<circle cx=880 cy=300 r=170 fill="url(#sunA)" />`
  - `<circle cx=880 cy=300 r=56 fill="#f5b86a" opacity=0.85 />`
- Sun B group (`animation: duneSunPulse 11s ease-in-out infinite reverse`):
  - `<circle cx=1020 cy=240 r=100 fill="url(#sunB)" />`
  - `<circle cx=1020 cy=240 r=28 fill="#e8623d" opacity=0.9 />`
- Birds (3 tiny stroked m-shapes, `animation: duneBirdDrift 18s linear infinite`):
  - `M 240 180 q 6 -6 12 0 q 6 -6 12 0` stroke ink 1.2 fill none
  - `M 320 210 q 5 -5 10 0 q 5 -5 10 0` stroke ink 1.1 fill none
  - `M 180 250 q 4 -4 8 0 q 4 -4 8 0` stroke ink 1 fill none
- 3 layered dunes (paths fill sand1, sand2, sand3):
  ```
  M 0 380 Q 200 340 420 360 T 820 360 T 1280 350 L 1280 520 L 0 520 Z   /* sand1 */
  M 0 420 Q 180 390 380 410 T 760 405 T 1280 400 L 1280 520 L 0 520 Z   /* sand2 */
  M 0 470 Q 220 450 460 460 T 880 455 T 1280 460 L 1280 520 L 0 520 Z   /* sand3 */
  ```
- Top-dune rim-light: same path as sand1 top edge, stroke `#fff5e0` 1.5, no fill, opacity 0.6.

**Layer B — SpiceField** (Canvas particle system, see `direction-b-editorial.jsx` lines ~22–73 for reference):
- 70 particles, seeded RNG (multiplier 9301, addend 49297, modulo 233280) so paint is deterministic across remounts.
- Per particle: x∈[0,W], y∈[0,H], radius 0.6–2.2px, vx 0.15–0.5, vy −0.05 to −0.17, sine wobble.
- Color: 50% `#c14a1a`, 25% `#e8623d`, 25% `#b89760`. Alpha 0.25–0.7.
- Wraps off-right → on-left, off-top → on-bottom.
- Canvas style: `position: absolute; inset: 0; mix-blend-mode: multiply; opacity: 0.7`.

**Content** (`max-width: 1100; z-index: 2`):
- H1: `I build tools, harnesses & systems for <span class="dune-shimmer">coding agents</span>.`
- Subhead `<p>` Inter 22 / 1.45 / `--ink-soft`, margin-top 36, max-width 720:
  - "Software engineer at <span class="dune-accent">Vimeflow</span>. Based in Sydney."
  - `<br/>` "Working in TypeScript, Rust, Python — agentic AI, full-stack, dev tooling."

**Scroll cue** (absolute, bottom 56, left 48): SVG down-arrow 28×28 + small caps "Scroll · See work" (Inter 11 / 0.22em / muted).

### 3. Currently strip (`padding: 32px 48px`, top+bottom 1px line, background `--bg-soft`)
4-col grid `repeat(4, 1fr)`, gap 32. Each cell:
- Row 1: 6×6 dot (i==1 → accent + `duneSunPulse 1.6s` infinite, else muted) + eyebrow.
- Row 2: Inter 20 / 500 / -0.01em — value
- Row 3: Inter 13 / muted — sub
- Cells 2–4 get `border-left: 1px solid --line; padding-left: 24px`.

| | Key | Value | Sub |
|---|---|---|---|
| 1 | Location | Sydney, AU | GMT+11 · open to remote |
| 2 | Now | Vimeflow | Software Engineer · 2025– |
| 3 | Building | Lifeline + wskills | Autonomous coding research |
| 4 | Status | Open to side gigs | Dev tools, agentic systems |

### 4. Selected Work (`padding: 48px 48px 80px`)
Header row: H2 `Selected Work <span muted>'26</span>` (left) · `All projects →` link (right, Inter 13 muted).

List body: `border-top: 1px solid --line` then 5 row anchors. Each row:
- Grid `1fr auto`, gap 32, align-items baseline, padding 36px 4px, `border-bottom: 1px solid --line`.
- Hover (smooth 0.2s): padding-left → 24px; `.title` color → `--accent`.
- Left column:
  - Meta row (mb 12, gap 14): 10×10 colored dot (per row, with `box-shadow: 0 0 0 4px <dot>22`) + eyebrow `<co> · '<yr> · <status>` Inter 11/0.18em.
  - `.title` H3: clamp(40,4.6vw,64) / 500 / -0.03em / 1.05.
  - Dek `<div>`: Inter 17 / `--ink-soft` / 1.5 / max-width 720, mt 14.
  - Tag chips row (mt 18, flex wrap, gap 6): each `JetBrains Mono 11 / --ink-soft`, padding `4px 10px`, `border: 1px solid --line; border-radius: 999px; letter-spacing: 0.02em`.
- Right column: 44×44 SVG circle (stroke `--line`) with arrow (`M16 22 H28 M22 16 L28 22 L22 28`, stroke ink 1.5).

| Title | Co/Year/Status | Dek | Dot | Tags |
|---|---|---|---|---|
| Vimeflow | Personal · '26 · Shipping | A control plane for coding agents — terminals, diffs, live status. | accent | TypeScript · React · Tauri |
| Lifeline | Personal · '25 · Active | Autonomous harness for Claude Code — paired Codex review, PR opener. | sun-1 | Python · Claude API · GitHub Actions |
| wskills | Personal · '25 · Maintained | A bilingual library of agent skills, distilled into repeatable workflows. | sun-2 | Markdown · EN / 中文 · OSS |
| llm-tui | Personal · '25 · Stable | A Rust terminal chat for local OpenAI-compatible LLM servers. | sand-3 | Rust · Ratatui · CLI |
| nvim | Personal · '24 · Daily driver | A cross-platform Neovim and tmux environment for reviewing agents. | muted | Lua · Neovim · tmux |

### 5. Stack & Tools (`padding: 64px 48px`, top 1px line)
Grid `300px 1fr`, gap 64.
- **Left rail:** eyebrow "Stack" + H2 "Tools I reach for, by gravity." (36/500/-0.02em).
- **Right:** 4-col grid, gap 32. Each column:
  - Header: eyebrow + bottom 1px line, padding-bottom 8.
  - Items: Inter 15 / `--ink-soft` / 1.5, gap 10.

| Languages | Agents | Runtime | Surface |
|---|---|---|---|
| TypeScript | Claude Code | Node | Neovim |
| Rust | Codex | Bun | tmux |
| Python | Cursor | Tauri | Astro |
| Lua | Aider | Cloudflare Workers | Obsidian |
| Go | | | |

### 6. Working Model (`padding: 80px 48px`, top 1px line)
Same `300px 1fr` rail layout.
- **Left:** eyebrow "Process" + H2 "Notes become articles, without changing tools."
- **Right:** 3 hairline rows, grid `60px 140px 1fr`, gap 24, padding 24 0, top+bottom lines.

| # | Heading | Body |
|---|---|---|
| 01 | Note | Write privately in Obsidian. Mark notes destined for the public vault. |
| 02 | Sync | A small script copies designated notes into the Astro blog collection. |
| 03 | Publish | Commit to GitHub. Pages workflow rebuilds. The site is current again. |

### 7. Activity Timeline (`padding: 80px 48px`, top 1px line)
Same rail.
- **Left:** eyebrow "Activity" + H2 "What I'm shipping right now." + STREAMING pill:
  - inline-flex, gap 8, padding `6px 12px`, border-radius 999, background `rgba(193,74,26,0.08)`, border `1px solid rgba(193,74,26,0.2)`.
  - 6×6 accent dot with `duneSunPulse 1.4s` + "STREAMING" (Inter 12 accent / 0.06em).
- **Right:** rail at `left: 7px, top: 6, bottom: 6, width: 1px, background --line`. Then 7 rows, grid `24px 80px 1fr`, gap 18, padding 14 0. Per row opacity `1 - i*0.08`.
  - Glyph: 16×16 circle, color `i==0 ? #fff : --bg`, font 10/700, with halo `box-shadow: 0 0 0 4px rgba(193,74,26,0.15)` on row 0.
  - Time: Inter 13 / muted / 0.04em.
  - Message: JetBrains Mono 14 / (row 0: ink 600, else ink-soft 400).

| Time | Glyph | Tone | Message |
|---|---|---|---|
| now | ⏵ | accent | lifeline · spec planner running |
| 12s | + | accent | commit · feat(vimeflow): live agent panel |
| 4m | ✓ | sun-2 | tests · 184 passed |
| 11m | ↑ | sun-2 | deploy · pages.dev built in 47s |
| 32m | ◆ | sand-3 | note · synced 3 entries from obsidian |
| 1h | ⊕ | sun-1 | pr · #18 opened on lifeline |
| 3h | ✎ | muted | draft · "RAG without the rag" wip |

(For now this is static markup with the fake data above. Wire to GitHub API later if desired — see "Future" below.)

### 8. Journal (`padding: 80px 48px`, top 1px line)
Header: left = eyebrow "Journal" + H2 "Field notes from the desert." (36/500/-0.02em). Right = `All posts →` link.

**Featured post anchor** (`grid 1.1fr 1fr`, gap 48, padding 36 0, top+bottom lines, mb 32):
- Left: aspect-ratio 4/3, border-radius 4, `background: linear-gradient(135deg, --sand-1 0%, --sun-2 50%, --accent 100%)`, with overlaid `radial-gradient(circle at 70% 30%, rgba(255,243,214,0.6), transparent 50%)`. Bottom-left "FEATURED" tag (Inter 11 white / 0.18em / text-shadow `0 1px 2px rgba(0,0,0,0.3)`).
- Right (centered vertically):
  - Meta: "Essay · Mar 2026 · 8 min" (Inter 12 muted / 0.08em / mb 14).
  - H3: "Why I let coding agents drive — and where I keep my hands on the wheel." (clamp(32,3.4vw,44) / 500 / -0.02em / 1.1).
  - Dek: Inter 17 / 1.6 / `--ink-soft` / max-width 540 — "A year of pairing with Claude and Codex on real shipping work. The patterns that survived, the ones that didn't, and the small rituals that make autonomous coding actually feel safe."
  - CTA row (mt 22, gap 10, accent): "Read essay" + 16×16 right-arrow SVG.

**Recent posts list** — 4 rows, grid `120px 100px 1fr 80px`, align-items baseline, gap 24, padding 20 4, bottom 1px line, hover slides 20px right + recolors title.

| Tag | Date | Title | Time |
|---|---|---|---|
| NOTES | Feb 2026 | Tmux as a control plane: my agent review setup. | 4 min |
| BUILD | Jan 2026 | Vimeflow, three months in — what changed and what didn't. | 6 min |
| TOOLS | Dec 2025 | A small Rust TUI that talks to any OpenAI-compatible server. | 5 min |
| PROCESS | Nov 2025 | Obsidian → Astro → GitHub Pages, with no extra cognitive load. | 3 min |

### 9. Colophon (`padding: 80px 48px`, top 1px line, background `--bg-soft`)
Same `300px 1fr` rail.
- **Left:** eyebrow "Colophon" + H2 "About this site."
- **Right** (max-width 720, gap 18):
  - P1 (Inter 17 / 1.65 / ink-soft): "This corner of the internet runs on Astro, lives on GitHub Pages, and is written mostly in Obsidian. The palette is warmed cream and terracotta, with two suns on the horizon — a small homage to the desert that loaned me its colors."
  - P2: "Type is set in Inter for body and headlines, JetBrains Mono for anything that should feel like it belongs in a terminal. No analytics, no popups, no newsletter. If something here is useful or wrong, [send me a note](mailto:)." (link styled accent + underline, underline-offset 3).
  - Credits row (mt 12, Inter 13 muted, gap 24, separated by `·`): `Astro 5 · Inter + JetBrains Mono · Hosted on Pages · Source on GitHub`.

### 10. Footer (`padding: 64px 48px 48px`, top 1px line)
3-col grid `1fr 1fr 1fr`, gap 32, align-items end.
- **Left:** monogram + name/role triplet (same as header, but text bottom-aligned).
- **Center:** eyebrow "Main" + nav (gap 18, Inter 500 / 16): Work · Blog · Info — all ink no underline.
- **Right:** eyebrow "Contact" + nav (justify-end, gap 18): LinkedIn · GitHub · Email.

Bottom rule (mt 56, padding-top 20, top 1px line, flex space-between, Inter 13 muted):
- Left: `© 2026 Will Wang. All Rights Reserved.`
- Right: `Made with coffee and long walks at Bondi (extra hot, no foam).`

---

## Implementation guidance for Astro

Suggested file layout:
```
src/
  layouts/Base.astro                  ← <head>, font links, global tokens
  pages/index.astro                   ← composes the sections below
  components/
    SiteHeader.astro
    Hero.astro
    TwinSunHorizon.astro              ← inline SVG
    SpiceField.astro                  ← <canvas> + <script> particle system
    CurrentlyStrip.astro
    SelectedWork.astro                ← imports work data from src/data/work.ts
    StackTools.astro                  ← imports stack data from src/data/stack.ts
    WorkingModel.astro
    ActivityTimeline.astro            ← static for now
    Journal.astro                     ← reads from content collection
    Colophon.astro
    SiteFooter.astro
  content/
    config.ts                         ← defines `posts` collection
    posts/                            ← markdown synced from Obsidian
  data/
    work.ts
    stack.ts
  styles/
    tokens.css                        ← :root vars from Design Tokens above
    base.css                          ← reset + body bg/font
```

### Astro-specific notes
- **Hero canvas:** the `SpiceField` must run client-side. In Astro, put the `<canvas>` in markup and add `<script>` (default = bundled, runs after parse) for the RAF loop.
- **Sun pulse + bird drift + accent shift + shimmer:** pure CSS keyframes — put in `tokens.css` so they're global.
- **Hover states:** the prototype uses inline JS handlers. In Astro, use plain CSS `:hover` selectors with `transition: padding 0.2s ease, color 0.2s ease`. Targeting the title-color change requires the row to be a single `<a>` with the `.title` as a child — use `a:hover .title { color: var(--accent) }` and `a:hover { padding-left: 24px }`.
- **Content:** the Journal section's recent posts must come from a real Astro content collection (`src/content/posts/`). Sort by date desc, take first 4 after the featured one. Featured = first post tagged `featured: true` in frontmatter, fallback to most recent.

### Frontmatter schema (`src/content/config.ts`)
```ts
import { defineCollection, z } from 'astro:content';
export const collections = {
  posts: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      tag: z.enum(['Essay', 'Notes', 'Build', 'Tools', 'Process']),
      date: z.date(),
      readMin: z.number(),
      featured: z.boolean().default(false),
      dek: z.string(),
    }),
  }),
};
```

---

## Acceptance criteria

A submission is considered done when **all** of the following are true:

1. Page renders at desktop (≥1024px) matching the prototype within 4px on all section paddings, gap values, and line offsets. Compare against `redesign.html`.
2. All 9 design-token color values are present in `tokens.css` and used everywhere — no inline hexes.
3. Inter (400/500/600) and JetBrains Mono (400) load self-hosted, no Google Fonts CDN.
4. Hero animations all running concurrently:
   - Two suns pulsing (9s + 11s reversed)
   - Birds drifting 18s linear
   - Spice particles physically drifting (canvas, 60fps idle)
   - "coding agents" shimmering 7s
   - "Vimeflow" cycling colors 8s
5. Currently strip's "Now" dot pulses at 1.6s; Activity STREAMING dot pulses at 1.4s.
6. Selected Work rows hover-slide right and recolor title to accent on hover (200ms easing).
7. Journal renders from `src/content/posts/` markdown — at least 1 featured + 4 recent must come from real content files. No hardcoded post data in components.
8. Lighthouse a11y ≥ 95, performance ≥ 90 on a static build.
9. No console errors or warnings on load.
10. Build succeeds for GitHub Pages with the configured `site` and `base`.

---

## Out of scope (do not build now)
- Mobile-specific redesign (responsive reflow only — let things stack at <1024px).
- Light/dark mode toggle.
- Live GitHub API wiring for the Activity timeline (static data is fine for v1).
- Individual post pages — the Journal section links to `#` placeholders for now.
- Sandworm animation (was prototyped, then explicitly removed).
- Marquee under hero (was prototyped, explicitly removed).

## Future
- Wire Activity timeline to GitHub Events API + commit firehose.
- Build `[...slug].astro` for individual post pages, matching the Journal aesthetic.
- Consider adding a `/about` page that promotes the Colophon to a full essay.

## Files in this bundle
- `redesign.html` — the design canvas wrapper. Open this to see the live prototype.
- `direction-b-editorial.jsx` — full source of the Direction B component. **This is your reference implementation** — every measurement, animation, and structural decision is here verbatim.
- `terminal-hero.jsx` — included for completeness; not used by Direction B.
- `screenshots/` — section-by-section captures of the prototype:
  - `01-hero.png` — header + hero (twin suns, particles, headline)
  - `02-currently-work.png` — Currently strip + top of Selected Work
  - `03-work-detail.png` — work rows with chips and meta
  - `04-stack-process.png` — Stack & Tools + Working Model
  - `05-activity-journal.png` — Activity timeline + Journal featured post
  - `06-colophon-footer.png` — Colophon + Footer
