# DESIGN.md — A.K. Navigator (Khalil-style Landing)

> Single-page portfolio landing with a WebGL gold-speck starfield, mouse-driven view rotation, sci-fi telescope viewport overlay, and scroll-revealed content sections. Dune/sci-fi navigator persona.

---

## 1. About this bundle

The files in this folder are **design references**, not production code:

- `khalil-landing.html` — the working hi-fi prototype. Open this in a browser to feel the motion. Every measurement, animation, and shader is here verbatim.
- `screenshots/` — section-by-section captures.
- `DESIGN.md` (this file) — single source of truth for tokens, layout, behaviors, and acceptance criteria.

Your job: **recreate this design in the target codebase using its existing patterns**, not lift the HTML wholesale.

## 2. Fidelity

**High-fidelity.** Match colors, sizes, paddings, and animation timings exactly. Where the prototype uses 1280px max-width content, preserve that on desktop (≥1024px) and let things stack gracefully below.

## 3. Target stack (recommended)

- Astro 5 (or Next.js 14 app router) — SSG / SSR friendly
- Plain CSS with tokens in a single `tokens.css` — no Tailwind
- Self-hosted Inter (300/400) + JetBrains Mono (400) via `@fontsource`
- Vanilla WebGL for the starfield (no three.js needed — see §7)
- IntersectionObserver for scroll reveals

---

## 4. Design tokens

### Colors
```css
--bg:        #1a1408;   /* warm dark */
--bg-deep:   #0e0a04;   /* page background */
--gold:      #c9a55a;   /* primary accent */
--gold-soft: #8a7038;   /* dimmed accent */
--ink:       #f0e6d2;   /* primary text */
--muted:     #6b5a36;   /* meta text */
```

### Typography
| Use | Family | Size | Weight | Tracking |
|---|---|---|---|---|
| Hero H1 "KHALIL" | Inter | clamp(56px, 9vw, 140px) | 300 | 0.32em |
| Section H2 | Inter | clamp(36px, 5vw, 64px) | 300 | 0.04em |
| Card H3 | Inter | 22px | 400 | 0.04em |
| Work-row title | Inter | 28px | 300 | 0.04em |
| Body | Inter | 18px | 400 | normal |
| Card body | Inter | 14px | 400 | normal |
| Eyebrow / corner UI | JetBrains Mono | 11px | 400 | 0.18–0.40em UPPERCASE |
| Sub-eyebrow | JetBrains Mono | 13px | 400 | 0.32em |
| Year tag | JetBrains Mono | 12px | 400 | 0.18em |

Hero H1 carries `text-shadow: 0 0 60px rgba(201,165,90,0.45), 0 0 120px rgba(201,165,90,0.2)` for the gold bloom, and `padding-left: 0.32em` to compensate for trailing letter-spacing.

### Spacing & layout
- Page horizontal padding: 48px
- Content max-width: 1280px (centered)
- Section vertical padding: 140px top + bottom
- Section divider: `1px solid rgba(201,165,90,0.15)`
- Corner UI inset: 32–36px from edges

---

## 5. Page anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ TL: A.K. NAVIGATOR / status / coords      TR: ☰ menu         │ ← fixed corners
│                                                              │
│       ┌─ scope frame (hairline, fixed) ──────────────┐       │
│       │                                              │       │
│       │           [ ARCHITECT OF SANDS ]             │       │
│       │                                              │       │
│       │                K H A L I L                   │       │ ← hero (100vh)
│       │                                              │       │
│       │           DESIGN  &  DEVELOPMENT             │       │
│       │                                              │       │
│       └──────────────────────────────────────────────┘       │
│ BL: ESTABLISHED // PRE-IMPERIAL    BR: v1.0 // BUILD 4216    │
└──────────────────────────────────────────────────────────────┘
                          ↓ scroll cue (gold ribbon)
─── below the fold, content sections ───────────────────────────
[ MANIFEST ]      "I build interfaces for autonomous systems."
[ DOCTRINE ]      3 cards: Craft / Harness / Surface
[ ARCHIVES ]      5 work rows: Vimeflow / Lifeline / wskills / llm-tui / nvim
[ TRANSMIT ]      Centered CTA — "Send a signal"
                  END OF TRANSMISSION
```

### 5.1 Background layer (z=0, fixed, full viewport)
- `<canvas id="stars">` covering 100vw × 100vh
- Beneath it, a CSS radial gradient `#1a1408 0% → #0a0703 80%` so stars never sit on pure black

### 5.2 Telescope scope overlay (z=4, fixed, pointer-events none)
A static decorative HUD that sits over the entire viewport:
- **Outer hairline rectangle** inset 36px, `1px solid rgba(201,165,90,0.18)`, with a 60×1px gold-soft tick centered on top + bottom edges
- **4 corner brackets** 28×28px, two-edge gold-soft borders
- **4 center crosshair ticks** at left/right/top/bottom mid (22×1px gold at 0.4 alpha)
- **Two rangefinder ladders** at left+right mid (6×240px, multi-stop linear gradient with the center stop at full gold)
- **Vignette**: `radial-gradient(ellipse at center, transparent 55%, rgba(10,7,3,0.55) 100%)` — darkens corners

### 5.3 Fixed corners (z=10)
Mono caps, 11px, line-height 1.8.
- **TL** — gold:
  - `A.K. NAVIGATOR` (13px, 0.32em tracking)
  - `SYSTEM STATUS: HARVESTING [98.2%]` (label color = gold-soft)
  - `COORDINATES: 28°24'N 34°25'E`
- **TR** — menu (see §5.4)
- **BL** — gold-soft:
  - `ESTABLISHED // PRE-IMPERIAL ERA`
  - `ALL RIGHTS RESERVED // © 10191 AG`
- **BR** — gold-soft: `v1.0 // BUILD 4216`

### 5.4 Hover menu (TR)
- 44×44 button, 1px gold-soft border, two 14×1px gold bars stacked, 5px gap
- Wrap has 24px invisible padding (hover buffer)
- On hover: border → gold, background → `rgba(40,28,12,0.6)`, bars rotate ±8° and converge by 3px
- Links panel: absolute, top: 100%, right-aligned, gap 14px
- Links: 13px / 0.32em / cream, fade+slide in with 50ms staggered delays
- `::after` underline animates from 0 → 100% width on hover; `.current` link has full underline by default

### 5.5 Custom reticle
- 22×22 circle border 1px gold + 6×1px tick on top
- Position smoothly lerps toward cursor (0.08 factor)
- z=5, pointer-events none

### 5.6 Hero (z=2, height 100vh, flex centered)
- Eyebrow: `[ ARCHITECT OF SANDS ]` (square brackets injected via `::before`/`::after`)
- H1 `KHALIL`: clamp(56px, 9vw, 140px), weight 300, tracking 0.32em, white with gold bloom shadow
- Sub: `DESIGN  &  DEVELOPMENT` (gold, 13px, 0.4em)

### 5.7 Scroll cue (fixed, bottom 24, center)
1×40px vertical ribbon, gold gradient from transparent → solid → transparent, animation `cueDrop` 2.4s ease-in-out infinite (8px Y bob + opacity 0.4 → 0.9).

### 5.8 Content sections (z=2, max-width 1280, padding 48px)
Every section:
- Padding 140px vertical
- Top hairline divider (skip on first)
- Eyebrow `[ XYZ ]` in mono caps gold
- H2 in Inter 300, white, mb 32
- Body 18px / 1.7 / `rgba(240,230,210,0.75)` / max-width 680

#### MANIFEST — single text block, no extras

#### DOCTRINE — `grid-template-columns: repeat(3, 1fr); gap: 48px`, mt 56
Each `.card`:
- 1px gold-soft@20% border
- 28px padding
- `background: rgba(20,15,8,0.4); backdrop-filter: blur(8px)`
- Num eyebrow (mono caps gold, mb 16): `001 // CRAFT`, `002 // HARNESS`, `003 // SURFACE`
- H3 (Inter 22 / 400 / white / 0.04em / mb 14)
- Body (14px / 1.65 / cream@65%)

#### ARCHIVES — `.work-row`
Grid `80px 1fr 200px 80px`, gap 32, padding 28 0, bottom hairline.
Hover: padding-left → 16px, color → gold (300ms ease).
Columns:
1. `// '26` — mono 12 / 0.18em / gold-soft
2. Title — Inter 28 / 300 / 0.04em
3. Tag — mono 12 / 0.18em / muted / UPPERCASE
4. Arrow `→` — gold, 16px, right-aligned

Default rows:
| Year | Title | Tag |
|---|---|---|
| '26 | Vimeflow | CONTROL PLANE |
| '25 | Lifeline | AUTO HARNESS |
| '25 | wskills | SKILL LIBRARY |
| '25 | llm-tui | RUST · CLI |
| '24 | nvim | DAILY DRIVER |

#### TRANSMIT — text-align center
- H2 "Send a signal."
- Body centered, max 680, mb 32
- CTA `<a>`: 16px 40px padding, 1px gold border, gold text, 12px / 0.32em, no underline
- Below, after section: small "END OF TRANSMISSION" (gold-soft, 11/0.18em, 48px vertical padding)

---

## 6. Animations

### 6.1 CSS keyframes
```css
@keyframes cueDrop {
  0%,100% { transform: translateX(-50%) translateY(0);  opacity: 0.4; }
  50%     { transform: translateX(-50%) translateY(8px); opacity: 0.9; }
}
```

### 6.2 Scroll reveal
Apply `.reveal` to each `<section class="block">`:
```css
.reveal { opacity: 0; transform: translateY(40px); transition: opacity 1s ease, transform 1s ease; }
.reveal.in { opacity: 1; transform: translateY(0); }
```
Add `.in` via IntersectionObserver (`threshold: 0.05, rootMargin: '0px 0px -5% 0px'`) plus a scroll-listener fallback, plus a one-shot rAF poll on load — three belts so a section never gets stranded invisible.

### 6.3 Mouse parallax (driven by shader uniforms — see §7)
- Smooth lerp the cursor toward target (`mx += (targetMx - mx) * 0.04`)
- Yaw range: ±0.35 rad, pitch range: ±0.25 rad

### 6.4 Reticle follow
- Separate lerp (0.08 factor) on the `.target` div's `left` / `top`

---

## 7. WebGL starfield

### 7.1 Geometry
- 1800 points, position randomized in a 3D box: `x∈[-1.6, 1.6], y∈[-1.2, 1.2], z∈[-0.6, 0.6]`
- Per-point `size ∈ [1.2, 4.4]px` and `seed ∈ [0,1]`
- Static buffers; no per-frame uploads

### 7.2 Vertex shader (mouse rotation + perspective)
```glsl
precision mediump float;
attribute vec3 a_pos;
attribute float a_size;
attribute float a_seed;
uniform vec2 u_mouse;       // [-1,1] both axes
uniform vec2 u_resolution;
uniform float u_time;
varying float v_seed;
varying float v_depth;
void main() {
  float yaw   = u_mouse.x * 0.35;
  float pitch = u_mouse.y * 0.25;
  vec3 p = a_pos;
  float cy = cos(yaw),   sy = sin(yaw);
  p = vec3(cy*p.x + sy*p.z, p.y, -sy*p.x + cy*p.z);
  float cp = cos(pitch), sp = sin(pitch);
  p = vec3(p.x, cp*p.y - sp*p.z, sp*p.y + cp*p.z);
  // gentle drift over time
  p.x += sin(u_time * 0.05 + a_seed * 6.28) * 0.04;
  p.y += cos(u_time * 0.04 + a_seed * 3.14) * 0.03;
  float depth = clamp(p.z + 0.9, 0.15, 1.8);
  vec2 projected = vec2(p.x, p.y) * 0.35 / depth;
  gl_Position = vec4(projected, 0.0, 1.0);
  gl_PointSize = a_size * (1.0 / depth) * (u_resolution.y / 800.0);
  v_seed  = a_seed;
  v_depth = depth;
}
```

### 7.3 Fragment shader (square sparkle + halo + twinkle)
```glsl
precision mediump float;
varying float v_seed;
varying float v_depth;
uniform float u_time;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  float sq = max(abs(c.x), abs(c.y));
  float sparkle = 1.0 - smoothstep(0.20, 0.42, sq);
  float halo = pow(1.0 - smoothstep(0.0, 0.5, d), 3.0) * 0.45;
  vec3 gold = vec3(0.79, 0.65, 0.35);
  vec3 col = gold * (sparkle + halo);
  col *= mix(0.4, 1.0, 1.0 - v_depth * 0.4);
  float tw = 0.55 + 0.45 * sin(u_time * 1.6 + v_seed * 12.0);
  col *= tw;
  float a = (sparkle + halo) * tw;
  if (a < 0.02) discard;
  gl_FragColor = vec4(col, a);
}
```

### 7.4 GL state
- Context: `webgl` with `{ alpha: true, antialias: false, premultipliedAlpha: false }`
- DPR: `Math.min(window.devicePixelRatio, 2)`
- Blend: `gl.SRC_ALPHA, gl.ONE` (additive, gives the bloom)
- Clear: transparent (the gradient on the canvas's CSS bg shows through)
- Resize handler: re-set `canvas.width/height` and `gl.viewport`

### 7.5 Robustness
**Each subsystem must be wrapped in its own IIFE** — a WebGL link failure must not break the IntersectionObserver, and vice versa. The reference HTML does this; preserve the pattern.

---

## 8. UI standards / interaction rules

1. **No hover for primary navigation on touch devices.** Menu opens on tap; close on outside tap or Escape. The desktop hover open is a progressive enhancement.
2. **Reduced motion.** If `(prefers-reduced-motion: reduce)`:
   - Disable WebGL twinkle (set `u_time` to a constant)
   - Skip mouse-parallax lerp (snap to 0,0)
   - Replace scroll reveal with instant visibility (`.reveal { opacity: 1; transform: none; }`)
   - Skip cue-drop animation
3. **Color contrast.** All gold-on-dark text must clear WCAG AA at the listed sizes. Body text uses cream@75%, never gold-soft, for paragraph copy.
4. **Focus states.** Every interactive element (menu links, work rows, CTA, archive arrow) must show a visible focus ring — `outline: 1px solid var(--gold); outline-offset: 4px;` — independent of hover.
5. **No emoji.** Decorative glyphs are limited to: `→ // · [ ]` and the 4 telescope brackets/ticks.
6. **Z-index ladder** — use exactly these:
   - 0: `#stars` canvas
   - 2: hero + content sections
   - 4: scope HUD overlay
   - 5: cursor reticle
   - 6: scroll cue
   - 10: corner UI / menu

---

## 9. Acceptance criteria

A submission is done when **all** are true:

1. Page renders at desktop (≥1024px) within 4px of every measurement in this doc.
2. All 6 design-token colors live in a single `tokens.css` and are referenced everywhere.
3. Inter (300/400) + JetBrains Mono (400) load self-hosted.
4. WebGL starfield renders ≥1500 sparkles, twinkles continuously, and rotates with the mouse on yaw + pitch within ~250ms of cursor change.
5. Scope HUD (corners, ticks, ladders, vignette) is present and pixel-stable across resizes.
6. Scroll cue ribbon bobs vertically on a 2.4s loop.
7. All 4 reveal sections (`MANIFEST / DOCTRINE / ARCHIVES / TRANSMIT`) fade + rise into view as scrolled.
8. Menu opens on hover (desktop) and tap/click (mobile/touch); links stagger in over ~250ms.
9. `prefers-reduced-motion: reduce` collapses all motion as listed in §8.2.
10. Lighthouse a11y ≥ 95, performance ≥ 90 on a static build.
11. No console errors on load.

---

## 10. Out of scope (do not build)
- Real menu destinations (links can `href="#"`)
- Mobile redesign — let things stack at <1024px, do not redesign the scope overlay
- Light mode toggle — site is dark-only
- Sound design / audio
- Internationalization

## 11. Future
- Wire the menu links to real routes when other pages exist
- Add a `/works/[slug]` detail page styled to match the archives row
- Replace mock status numbers with real data (commit count, build hash)
