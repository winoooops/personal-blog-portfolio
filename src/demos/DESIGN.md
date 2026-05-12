# Demos subsystem — design contract

Demos are visual artifacts framed *inside* a blog post. They are not floating UI; they are not site chrome. This document defines what that means in concrete pixels and CSS rules.

## Visual identity: demo ≠ site

The site palette is **warm navigator** — deep brown background, warm gold accents.

The demo palette is **cool workspace** — deep navy background, soft purple/lavender accents. This is deliberate. When a reader scrolls into a demo, the color shift signals "this is an interactive artifact, not the post chrome." The same convention iOS/macOS use to distinguish modal sheets from underlying chrome.

Tokens live in `src/demos/shared/demo-tokens.css`:

| Variable | Value | Role |
|---|---|---|
| `--demo-bg` | `#0b0b18` | demo outer background |
| `--demo-surface` | `#181827` | inner panel background |
| `--demo-surface-2` | `#242438` | secondary surface (control bars, buttons) |
| `--demo-accent` | `#cba6f7` | primary action / focused state |
| `--demo-accent-2` | `#a6e3a1` | secondary action |
| `--demo-fg` | `#e3e0f7` | primary text |
| `--demo-fg-muted` | `#8a8299` | muted text, labels |
| `--demo-mono` | `'JetBrains Mono', ui-monospace, monospace` | code/control font |
| `--demo-radius` | `8px` | inner panel radius |
| `--demo-radius-outer` | `12px` | outer frame radius |
| `--demo-gap` | `8px` | inner spacing |

## Dimensions

| Property | Value |
|---|---|
| Width | match `.prose` max width (currently 65ch / ~720px) — never wider |
| Height | each demo decides, but typically `420px` for layout demos; cap at `560px` so the demo never dominates a screen |
| Padding inside frame | `16px` |
| Margin around frame | `40px 0` (matches `.prose` paragraph rhythm) |

## Motion principles

| Concern | Rule |
|---|---|
| Default duration | `220ms` (matches site reveal animations) |
| Easing | `cubic-bezier(0.32, 0.72, 0, 1)` — fast start, soft land |
| Reduced motion | every demo MUST honor `prefers-reduced-motion: reduce` by skipping the animation entirely (set the new state instantly) |
| Direction | layout transitions move horizontally + vertically as needed; no spin / rotate / scale unless the demo is specifically teaching that |

## Required chrome

Every demo wraps in `<DemoFrame>`, which provides:

1. **Eyebrow** — `[ DEMO // <subject> ]` in monospace, sets the tone
2. **Title** — short, plain English ("Dock position", "Color blender")
3. **Body slot** — the interactive area
4. **View source link** — deep link to the demo's source folder on GitHub

The eyebrow is non-negotiable. It's the reader's signpost that the colors and behavior changed because they're now in a demo, not the prose.

## Lazy loading

Astro renders demos as static HTML at build time. Each demo's JS only initializes when scrolled into view, via `shared/observe.ts`:

- The demo's outer element gets a `data-demo-init` attribute referencing an init function.
- `observe.ts` watches all `[data-demo-init]` elements with IntersectionObserver.
- On intersection, the corresponding init runs once, attaches event listeners, and disconnects.

This means the markup is in the page from page load, layout reserves the space, and the script cost is paid only if the reader scrolls there. Bundle size for a non-scrolled demo is ~CSS only.

## Boundary: when a demo should become a Vercel iframe instead

A demo belongs in `src/demos/` only if:

- ✅ Uses only browser-native APIs (no React/Vue/Motion/D3 etc. imports), **OR**
  the post itself is specifically teaching the framework's API (see "Framework
  escape hatch" below).
- ✅ Has no backend or persistence (no API, no localStorage state that survives across sessions)
- ✅ Fits in ≤ ~500 lines of code (CSS + TS combined)
- ✅ Is the right pedagogical fit — the demo *is* the lesson

If any of those fail, the demo becomes a separate project deployed to Vercel and embedded via iframe at a subdomain (`demo-<name>.winoooops.com`). See `AGENTS.md` for that escape hatch.

## Framework escape hatch (use sparingly)

When a post is specifically teaching the API of a particular framework
(e.g., the Motion / framer-motion `layout` and `layoutId` post), the
"no npm deps" rule yields to pedagogical fidelity. The reader needs
to see the actual framework code, not an analog.

The pattern:

1. Implement the demo as an Astro React island (`Workspace.tsx` lives
   alongside the demo's `index.astro`).
2. Wrap with `<Workspace client:visible />` so the framework JS only
   loads when the demo scrolls into view.
3. Astro's per-route code-splitting means other blog pages never
   include the framework bundle — only the post that imports the demo
   pays the cost.
4. Document the framework rationale in the demo's own intro comments.

This has been exercised once so far, for `src/demos/vimeflow-workspace/`
(Motion / framer-motion). Treat that as the template, not the norm.
Defaults stay vanilla.

## Accessibility floor

- Every interactive control is `<button>` (not `<div>` with onclick).
- Every demo must be keyboard-operable: focus visible, tab order sane, Enter/Space activate.
- Color contrast ≥ 4.5:1 for body text against `--demo-surface`.
- `prefers-reduced-motion` respected (see Motion principles above).
- Decorative elements use `aria-hidden="true"`.
- Live state changes that aren't visible to keyboard users get a polite `aria-live` region OR a status label that updates with the state.
