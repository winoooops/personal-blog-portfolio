# View Transitions Cross-fade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 220ms cross-fade page transition to every navigation on the site using Astro's built-in View Transitions API.

**Architecture:** `<ViewTransitions />` is added to `BaseLayout.astro`'s `<head>` — this activates Astro's client-side router for all `<a>` navigations and wires up the default fade animation. A `<style is:global>` block in the same file tunes the duration and adds a `prefers-reduced-motion` guard. No new files or components are created.

**Tech Stack:** Astro 6, `astro:transitions` (built-in), CSS `::view-transition-*` pseudo-elements.

---

### Task 1: Enable View Transitions in BaseLayout.astro

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add the ViewTransitions import to the frontmatter**

Open `src/layouts/BaseLayout.astro`. The current frontmatter block starts at line 1:

```astro
---
import '../styles/global.css';
import { profile } from '../data/profile';
import { withBase } from '../lib/paths';
import { ViewTransitions } from 'astro:transitions';
```

Add the `ViewTransitions` import as the fourth import (after `withBase`).

- [ ] **Step 2: Place `<ViewTransitions />` inside `<head>`**

In the same file, the `<head>` block currently ends with `<title>`. Add the component just before `</head>`:

```astro
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href={withBase('/favicon.svg')} />
    <link rel="icon" href={withBase('/favicon.ico')} />
    <title>{pageTitle}</title>
    <ViewTransitions />
  </head>
```

- [ ] **Step 3: Add the animation tuning styles**

Directly after `</head>`, add a `<style is:global>` block. `is:global` is required here — `::view-transition-*` pseudo-elements live outside the component's shadow scope:

```astro
<style is:global>
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 220ms;
    animation-timing-function: ease-in-out;
  }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: 0.01ms;
    }
  }
</style>
```

- [ ] **Step 4: Verify the build is clean**

```bash
npm run build
```

Expected output ends with:
```
[build] Complete!
```

No TypeScript errors, no missing import warnings.

- [ ] **Step 5: Start the dev server and manually verify the transition**

```bash
npm run dev
```

Open `http://localhost:4321` (or whichever port Astro picks). Click between at least two of these routes:

- Home → Blog index
- Blog index → any post
- Any post → Contact

Expected: each navigation produces a smooth cross-fade (~220ms). The page does not flash white. The header fades with the rest of the page.

- [ ] **Step 6: Verify `Base.astro` is untouched**

Open `src/layouts/Base.astro` — confirm it has no `ViewTransitions` import or tag. Demo pages should navigate normally without the transition.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "Add View Transitions cross-fade to BaseLayout"
```

- [ ] **Step 8: Push**

```bash
git push
```
