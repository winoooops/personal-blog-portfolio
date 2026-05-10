# Kickoff Prompt — A.K. Navigator Landing

Paste this into your local agent (Claude Code, Cursor, etc.) as the first message:

---

```
You are implementing a single-page portfolio landing from a design handoff bundle.

## Context
- Bundle root: ./design_handoff_khalil/
- Single source of truth: ./design_handoff_khalil/DESIGN.md
- Reference implementation (READ END-TO-END FIRST): ./design_handoff_khalil/khalil-landing.html
- Visual reference: ./design_handoff_khalil/screenshots/*.png

## Target stack
- Astro 5 (or Next.js 14 app router) — static export
- Plain CSS with tokens in src/styles/tokens.css — no Tailwind
- Self-hosted Inter (300/400) + JetBrains Mono (400) via @fontsource
- Vanilla WebGL for the starfield (no three.js)
- IntersectionObserver + scroll fallback for reveals

## Workflow — execute in order, do NOT skip

1. READ DESIGN.md cover to cover. Then open khalil-landing.html in a browser, move the mouse around the hero, scroll all the way down. Read the file's source end-to-end. Confirm you understand:
   - The 4-layer Z stack (canvas → content → scope HUD → corners/menu)
   - The WebGL setup (1800 points, mouse-rotated, square sparkle + halo + twinkle)
   - The scope HUD anatomy (frame + corners + ticks + ladders + vignette)
   - The 4 content sections (MANIFEST, DOCTRINE, ARCHIVES, TRANSMIT) and their reveal transition

2. SCAFFOLD:
   - npm create astro@latest, minimal template, TypeScript strict
   - Add @fontsource/inter (300, 400) and @fontsource/jetbrains-mono (400)
   - Create src/styles/tokens.css with the 6 colors from DESIGN.md §4
   - Create src/styles/base.css with reset + body bg/font + reveal classes + cueDrop keyframe
   - Wire both into src/layouts/Base.astro

3. BUILD components in this order, screenshot-diffing as you go:
   - <Starfield /> — the canvas + WebGL setup, wrapped in its own IIFE
   - <ScopeHUD /> — pure CSS overlay (corners + ticks + ladders + vignette)
   - <Corners /> — TL/TR/BL/BR fixed elements (TR includes <Menu />)
   - <Menu /> — hover/tap-open with staggered link reveals
   - <Reticle /> — cursor follower
   - <Hero /> — eyebrow + KHALIL + sub
   - <ScrollCue /> — bobbing ribbon
   - <Manifest />, <Doctrine />, <Archives />, <Transmit /> — the 4 content blocks

4. EACH subsystem MUST be in its own IIFE / scoped script. A WebGL link failure must not break the IntersectionObserver. The reference HTML does this — keep the pattern.

5. ACCESSIBILITY pass:
   - Wire prefers-reduced-motion per DESIGN.md §8.2
   - Visible focus ring (1px gold, offset 4px) on every interactive element
   - Touch-friendly menu (tap toggle, outside-tap close, Escape close)
   - Verify Lighthouse a11y ≥ 95

6. ACCEPTANCE: walk through every item in DESIGN.md §9 and confirm it passes.

## Hard constraints
- Match every color, font size, padding, gap, and animation duration exactly. Do NOT improvise or substitute.
- No three.js, no Tailwind, no UI libraries, no Google Fonts CDN, no analytics.
- Hero parallax driven by shader uniforms — do NOT rotate DOM elements via JS transforms.
- Mobile responsive is out of scope for v1 — let things stack at <1024px, do not redesign the scope HUD.

## Definition of done
All 11 acceptance criteria in DESIGN.md §9 pass. When done:
- astro build → clean output
- Open the build, move the mouse, scroll through every section, verify it matches each screenshot
- Lighthouse a11y ≥ 95, perf ≥ 90
- Open a PR titled "Implement A.K. Navigator landing per Khalil handoff" with §9's checklist

## When you're stuck
- The reference HTML has the answer. Every shader uniform, every keyframe, every measurement is there verbatim.
- If DESIGN.md and khalil-landing.html disagree, the HTML wins — it produced the screenshots.
- If you genuinely need a decision the spec doesn't cover, stop and ask before guessing.

Begin with step 1. Confirm understanding of the 4-layer Z stack and the IIFE robustness rule before writing code.
```

---

## Tips for using this prompt

- **Run it on a single agent session that has the bundle in its working directory.** The prompt assumes paths like `./design_handoff_khalil/...`.
- **Do not paste DESIGN.md inline** — let the agent read it from disk. That keeps your context window free for diffs and iteration.
- **For Claude Code specifically**: after the agent confirms understanding, ask it to produce a file-by-file plan before any code lands. Approve the plan, then let it execute.
- **For Cursor**: open `DESIGN.md` and `khalil-landing.html` in the editor first so they're indexed for the agent's retrieval.
