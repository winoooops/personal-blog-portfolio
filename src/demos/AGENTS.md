# Demos subsystem — agent guidance

This subtree (`src/demos/`) contains **isolated interactive demonstrations** that get embedded inline in blog posts. It is deliberately separate from the rest of the site.

## Treat as separate from the site

- **Do not refactor demo code together with site code.** A change to `src/components/Hero.astro` should never touch anything under `src/demos/`. A change to a demo should never touch site components or styles.
- **Do not lift demo logic into shared site components.** Demos are throwaway artifacts that travel with a specific blog post. They are not a component library.
- **Do not import from `src/components/` or `src/styles/` inside a demo.** Demos take their styling from `src/demos/shared/demo-tokens.css` and ship in their own visual language (deliberately distinct from site chrome so readers can tell what is "demo" vs "site").
- **Do not add npm dependencies for a demo.** The cardinal rule of this subsystem is **demos use only browser-native primitives**: HTML, CSS, vanilla TypeScript, Web Animations API, View Transitions API, IntersectionObserver, CSS Grid/Flex. If a demo genuinely requires React, Motion, D3, or another framework, it does not belong here — it becomes a Vercel iframe at a subdomain instead (see DESIGN.md for the boundary).

## Why this isolation matters

1. **Maintenance scope**: Demos written in 2026 should still build in 2030 without dependency churn. Web platform primitives are stable; npm packages drift.
2. **Dependabot quiet**: Zero deps means zero version alerts. The site itself does not chase patch versions; demos must not introduce that work either.
3. **Bundle hygiene**: Tree-shaking + lazy loading work cleanly when each demo is self-contained. Cross-imports break that property.
4. **Pedagogical clarity**: Posts about web primitives (animation, layout, accessibility) feel more honest when demos use the same primitives the post is teaching, not a framework that hides them.

## Structure

```
src/demos/
├── AGENTS.md                 ← this file
├── DESIGN.md                 ← visual + UX contract
├── README.md                 ← author docs for "how to add a new demo"
├── shared/
│   ├── demo-tokens.css       ← CSS vars: colors, fonts, spacing
│   ├── DemoFrame.astro       ← consistent chrome wrapper (eyebrow, title, view-source)
│   └── observe.ts            ← IntersectionObserver helper for deferred init
└── <demo-name>/
    ├── index.astro           ← demo entry, wraps content in <DemoFrame>
    ├── demo.css              ← scoped to this demo only
    └── demo.ts               ← vanilla TS, no framework imports
```

## Adding a new demo

1. Create `src/demos/<your-demo-name>/`.
2. Copy the three files (`index.astro`, `demo.css`, `demo.ts`) from any existing demo as a template.
3. Use only Web Platform APIs. If you reach for `npm install`, stop and ask whether the demo should be a Vercel iframe instead (see DESIGN.md, "When this is the wrong tier").
4. Import the demo into a blog post like any other Astro component.
5. Use the demo's structure to wrap with `<DemoFrame>` for visual consistency.

## When this is the wrong tier

If your demo:
- Needs a backend, database, or authentication → Vercel iframe.
- Needs a framework (React, Vue, Svelte) due to genuine state complexity → Vercel iframe.
- Is more than ~500 lines of code → consider a Vercel iframe.
- Is a one-shot illustration ≤ 30 lines and won't be reused → consider inlining `<script>` directly in the blog markdown instead of building a folder here.

## Escape hatch: CDN injection in markdown

For ≤ 30-line illustrations that need a specific library (e.g., a one-off D3 chart, a tiny KaTeX snippet), it is acceptable to `<script src="https://cdn.jsdelivr.net/...">` directly in the markdown of a single post. Use SRI hashes. This is the only path that bypasses the "no npm deps" rule, and only because the dependency does not enter the repo.
