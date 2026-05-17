# Design: Global Page Transition (View Transitions API)

**Date:** 2026-05-16  
**Status:** Approved

## Problem

MPA navigation causes a hard full-page reload — the viewport goes blank before the new page paints, creating a jarring halt between navigations.

## Decision

Use Astro's built-in View Transitions API to add a cross-fade between every page navigation. The whole viewport dissolves out, then the new page fades in.

## Scope

- **In:** `src/layouts/BaseLayout.astro` — the layout used by all site pages (home, blog index, blog post, contact, contact-success).
- **Out:** `src/layouts/Base.astro` — used only by demos; no transition needed there.
- **Out:** Scroll/reveal animations, the custom cursor (Reticle), BGM toggle — untouched.

## Implementation

### 1. Enable View Transitions

Add `<ViewTransitions />` to the `<head>` of `BaseLayout.astro`:

```astro
import { ViewTransitions } from 'astro:transitions';
---
<head>
  ...
  <ViewTransitions />
</head>
```

This activates Astro's client-side router for all `<a>` navigations and wires up the default `fade` animation.

### 2. Tune the animation

Add a `<style is:global>` block in `BaseLayout.astro` to set duration and easing. Astro's default (180ms) is slightly abrupt; 220ms with `ease-in-out` reads as intentional without feeling slow:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 220ms;
  animation-timing-function: ease-in-out;
}
```

### 3. Respect reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.01ms;
  }
}
```

Astro skips the transition automatically when `prefers-reduced-motion` is set, but this rule ensures any CSS-side animation also collapses to instant.

## What does not change

- No new components or files.
- No changes to existing styles, scripts, or layouts other than `BaseLayout.astro`.
- Existing scroll-reveal animations, the Reticle cursor, and the BGM toggle all continue to work — they are scoped to individual components and are not affected by the router swap.

## Browser support

View Transitions API is supported in Chrome 111+, Edge 111+, and Safari 18+. In unsupported browsers (Firefox), Astro falls back to a standard navigation — no breakage, just no fade.
