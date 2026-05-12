# How to add a new demo

A 10-minute walkthrough for building a new inline blog demo.

## 1. Decide if this belongs here

Open `AGENTS.md`. If your demo needs npm deps, a backend, or > 500 lines, it should be a Vercel iframe instead. Bail out now.

## 2. Copy the template

```sh
cp -r src/demos/motion-layout-dock src/demos/<your-demo-name>
```

Three files:
- `index.astro` — entry, wraps content in `<DemoFrame>`
- `demo.css` — scoped to this demo only, uses tokens from `../shared/demo-tokens.css`
- `demo.ts` — vanilla TypeScript, no framework imports

## 3. Edit the eyebrow, title, and source link

In `index.astro`, set `eyebrow`, `title`, and `source` props on `<DemoFrame>`. The source link should point to this demo's folder on GitHub.

## 4. Write the demo

- HTML structure inside the `<DemoFrame>` slot.
- CSS in `demo.css` — scope class names to avoid bleeding (e.g., `.<demo-name>-root`, `.<demo-name>-button`).
- TS in `demo.ts`. Export a default function that takes a root element and wires up listeners.
- Add `data-demo-init="<demo-name>"` to the demo root. The shared observer picks it up.

## 5. Register the init function

In `shared/observe.ts`, add your demo name + a dynamic import:

```ts
const demos: Record<string, () => Promise<{ default: (root: HTMLElement) => void }>> = {
  'motion-layout-dock': () => import('../motion-layout-dock/demo.ts'),
  '<your-demo-name>': () => import('../<your-demo-name>/demo.ts'),
};
```

Dynamic imports keep the bundle split per demo.

## 6. Embed in a blog post

```astro
---
import MotionLayoutDock from '../../demos/motion-layout-dock/index.astro';
---

<MotionLayoutDock />
```

## 7. Check `prefers-reduced-motion`

Your demo must work with reduced motion turned on. Test it: macOS → Settings → Accessibility → Display → Reduce motion. If your animation skips, the new state should still be correct.

## 8. Test locally

```sh
npm run dev
# open the blog post, scroll to the demo, confirm:
# - structure renders before any JS loads
# - animation runs on interaction
# - View Source link goes to the right place on GitHub
# - reduced motion gracefully skips animation
```

## 9. Don't forget the boundary

Re-read `AGENTS.md`. If you reached for `npm install` mid-build, stop and reconsider whether this demo belongs here.
