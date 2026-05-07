# Frontend Functional Features — Design

**Date:** 2026-05-06
**Status:** Draft, awaiting review
**Scope:** Add three dynamic / app-like features to the Astro static site without giving up GitHub Pages hosting.

## Goals

1. **Live GitHub project data** on the home page — augment hand-written project cards with stars, last-commit recency, and primary language pulled at build time.
2. **Working contact form** at a dedicated `/contact/` route, delivering messages via Web3Forms.
3. **Comments on blog posts** via giscus (GitHub Discussions backed), one thread per post.

## Non-goals

- Dark-mode theme switcher (giscus stays on `light`).
- View counter, newsletter signup, related-posts logic, search.
- Server-side rate-limiting for the contact form (Web3Forms does this).
- Test framework adoption — repo currently has none, validation stays `npm run build` + manual checklist.

## Architecture overview

Three independent features, each with one clear boundary, communicating through typed props or env vars:

```
profile.ts → enrichProjects() (build) → index.astro → ProjectCard
ContactForm → fetch(Web3Forms) → success/error state in same page
[...slug].astro → <Giscus /> → giscus.app script in browser
```

The GitHub data layer is the only piece with real logic (network, caching, error handling), so it gets its own module. Contact form and giscus are essentially declarative wrappers, so they live as Astro components only — no service module for them.

## File layout

### New files

- `src/lib/github.ts` — `fetchRepoStats(owner, repo)` and `enrichProjects(projects)` helpers. Caches results in `.cache/github.json`. Catches all errors and returns un-enriched projects so the build never fails because GitHub is down.
- `src/components/ContactForm.astro` — form markup + scoped `<script>` for client-side validation and Web3Forms submit, plus inline success/error states.
- `src/components/Giscus.astro` — wrapper around the giscus loader script; reads config from `import.meta.env`.
- `src/pages/contact.astro` — new route. Uses `BaseLayout` + `ContactForm`, with a sidebar listing `profile.links`.
- `src/pages/contact-success.astro` — minimal "thanks" page. Acts as the JS-disabled fallback that Web3Forms can redirect to.
- `.env.example` — documents all env vars consumed by the build.

### Modified files

- `src/pages/index.astro` — calls `enrichProjects(projectStatuses)` in frontmatter, passes augmented array to `ProjectCard`.
- `src/components/ProjectCard.astro` — accepts new optional `live?: { stars, lastCommit, language }` prop. Renders a small badge row when present, nothing when absent.
- `src/data/profile.ts` — adds a single `contactBlurb` string under `profile`. No change to project entries; `github.ts` parses `owner`/`repo` from each project's `href`.
- `src/pages/blog/[...slug].astro` — append `<Giscus />` after `<Content />`.
- `src/layouts/BaseLayout.astro` — add `/contact/` to nav.
- `astro.config.mjs` — no change required (Astro auto-passes `PUBLIC_*` env vars).
- `.gitignore` — add `.cache/` and `.env`.
- `.github/workflows/deploy.yml` — pass `PUBLIC_WEB3FORMS_KEY`, `PUBLIC_GISCUS_*`, and `GITHUB_TOKEN` to the build step from repository secrets/variables.
- `README.md` and `AGENTS.md` — document new env vars and one-time setup steps.

## Feature: Live GitHub data

### Public surface of `src/lib/github.ts`

```ts
export type RepoStats = {
  stars: number;
  lastCommit: string;       // ISO date string
  language: string | null;  // GitHub primary language; may be null
};

export type LiveProject = Project & { live?: RepoStats };

export async function enrichProjects(
  projects: readonly Project[]
): Promise<LiveProject[]>;
```

`Project` is the existing element type from `projectStatuses`. `github.ts` parses `owner` and `repo` from each project's `href` using a regex against `https://github.com/<owner>/<repo>`. Non-GitHub URLs and missing `href` values skip enrichment without error.

### Behavior

1. For each project whose `href` parses to `<owner>/<repo>`, look up that key in `.cache/github.json`. If the cached entry is < 1 hour old, use it.
2. Otherwise call `GET https://api.github.com/repos/{owner}/{repo}` with `Accept: application/vnd.github+json`. If `GITHUB_TOKEN` env is set, send `Authorization: Bearer <token>`.
3. Map the response: `stargazers_count → stars`, `pushed_at → lastCommit`, `language → language`.
4. Write the result back into `.cache/github.json`.
5. On any error (network, 4xx, 5xx, rate-limit), log to stderr and return the project with `live: undefined`. Never throw.
6. Concurrency: `Promise.all` over all projects.

### Render

`ProjectCard.astro` adds a single `.project-meta` row when `live` is defined:

```
★ 24   ·   updated 3d ago   ·   TypeScript
```

Relative-time formatting uses `Intl.RelativeTimeFormat` (no library). Cards without a repo (none today, but profile.ts allows it) skip the row entirely.

### Why a build-time cache file

- Local `npm run dev` reuses results across HMR rebuilds — fast iteration, no rate-limit risk while editing CSS.
- CI runs fresh (cache isn't committed), so production deploys get current data.
- 1-hour TTL is configurable via a constant at the top of `github.ts`.

## Feature: Contact form

### Page (`src/pages/contact.astro`)

- `<BaseLayout title="Contact" description="…">`
- A `page-hero` block matching the blog index style — eyebrow "Contact", h1 "Get in touch", short blurb (`profile.contactBlurb`, new field).
- Two-column `split` body: left = `<ContactForm />`, right = `profile.links` rendered as a vertical list.
- Mobile collapses to single column via the existing `.split` breakpoint.

### Form fields

| Field | Required | Validation |
|---|---|---|
| Name | yes | non-empty, ≤ 80 chars |
| Email | yes | regex `/^\S+@\S+\.\S+$/` |
| Subject | no | ≤ 120 chars |
| Message | yes | non-empty, ≤ 2000 chars |
| `_honey` (honeypot) | hidden | must be empty (Web3Forms convention) |
| `access_key` | hidden | `import.meta.env.PUBLIC_WEB3FORMS_KEY` |
| `botcheck` | hidden | Web3Forms's hCaptcha-free spam check |
| `redirect` | hidden | `<site>/contact-success/` (no-JS fallback) |

Required fields use the native `required` attribute. Inline error spans appear only on submit attempt, not on every keystroke.

### Submit flow

1. Script intercepts `submit`, builds a `FormData`, posts JSON to `https://api.web3forms.com/submit`.
2. While in flight: button text "Sending…", form `aria-busy="true"`, button disabled.
3. On `200 + { success: true }`: replace the form with a success card. Page chrome stays so visitors can navigate away normally.
4. On any other response: inline error banner above the button; values preserved; "try again" affordance.
5. If the script never runs (CSP, JS disabled), the form falls back to a normal POST and Web3Forms redirects to `/contact-success/`.

### Styling

Reuses existing palette. Form fields get `border: 1px solid var(--line)`; focus ring uses `--accent`; submit button reuses `.button.primary`. No new CSS variables.

### Env

`PUBLIC_WEB3FORMS_KEY` is read at build time and embedded in HTML. Web3Forms keys are designed to ship publicly — security is origin-allowlist on Web3Forms' side, configured in their dashboard.

## Feature: giscus comments

### Component (`src/components/Giscus.astro`)

Reads config from `import.meta.env`. Props limited to `term` (defaults to page slug) and `category` overrides.

If any required env var is missing, the component renders only an HTML comment (`<!-- giscus disabled: missing env -->`) and emits nothing else. Local builds work before giscus.app setup is finished.

### Env vars (all `PUBLIC_*`)

- `PUBLIC_GISCUS_REPO` — `winoooops/personal-blog-portfolio`
- `PUBLIC_GISCUS_REPO_ID`
- `PUBLIC_GISCUS_CATEGORY` — e.g. `Comments`
- `PUBLIC_GISCUS_CATEGORY_ID`

### Configuration

- `mapping="pathname"` — one discussion thread per blog URL.
- `theme="light"` — matches current palette. No dark-mode toggle exists yet.
- Lazy-loads — does not block first paint.

### Position

Inside `[...slug].astro`, after the `<div class="prose">`:

```astro
<aside class="comments" aria-labelledby="comments-title">
  <h2 id="comments-title">Comments</h2>
  <Giscus />
</aside>
```

Top margin `clamp(48px, 8vw, 80px)` separates it from the article body.

### One-time manual setup

1. Push the repo to GitHub as public.
2. Settings → Features → enable **Discussions**.
3. Create a Discussion category named "Comments" of type "Announcement".
4. Install the giscus app: https://github.com/apps/giscus.
5. Visit https://giscus.app, enter repo + category, copy the four IDs.

These steps are documented in README and AGENTS.

### Failure modes

- giscus app not installed → script renders an error message inside its own iframe; nothing else breaks.
- Repo private → same.
- Visitor has third-party cookies blocked → widget loads but they can't sign in. Acceptable.

## Env var summary

| Var | Where | When | Default |
|---|---|---|---|
| `PUBLIC_WEB3FORMS_KEY` | client (form submit) | build → embedded in HTML | none — form shows disabled state |
| `PUBLIC_GISCUS_REPO` | client (giscus script) | build → embedded | none — comments hidden |
| `PUBLIC_GISCUS_REPO_ID` | client | build → embedded | none — comments hidden |
| `PUBLIC_GISCUS_CATEGORY` | client | build → embedded | none — comments hidden |
| `PUBLIC_GISCUS_CATEGORY_ID` | client | build → embedded | none — comments hidden |
| `GITHUB_TOKEN` | server (build only) | optional, raises rate limit | omitted = unauth fetch |

`PUBLIC_*` vars are designed to be public — security models for Web3Forms and giscus rely on origin allowlists, not key secrecy. `GITHUB_TOKEN` is the only true secret and never reaches the browser.

## Validation

No test framework is configured. Validation is `npm run build` plus a manual checklist.

### Pre-merge gates

1. `npm run build` passes with **no env vars set** — comments and form disable cleanly, GitHub badges silently absent.
2. `npm run build` passes with **all env vars set** — produces `/contact/` and `/contact-success/` HTML.
3. TypeScript clean (`astro check` if available; otherwise `tsc --noEmit`).

### Manual smoke test (post-deploy)

- Home: project cards show stars, "updated N ago", language for all 6 repos.
- Home: cards render correctly when a repo lookup fails (test locally by pointing one at `winoooops/does-not-exist`).
- `/contact/`: fill form, submit, confirm Web3Forms email arrives. Try empty required field — browser blocks. Try bad email — inline error span appears.
- Blog post: scroll to bottom, giscus widget loads. Sign in, post a test comment. Verify it appears in the GitHub Discussion.
- Mobile (≤ 520px): contact split collapses, form fields full-width, giscus iframe fits.
- Lighthouse on `/contact/` and one blog post: accessibility ≥ 95.

## Open questions

None. All design decisions captured above were chosen by the user during brainstorming.

## Implementation order (rough)

The plan-writing skill will produce the detailed steps; this is just the natural sequence:

1. `src/lib/github.ts` + `.cache/` plumbing → unit-testable in isolation.
2. `profile.ts` schema change + `ProjectCard` prop → home page lights up.
3. `ContactForm.astro` + `contact.astro` + `contact-success.astro` → /contact ships.
4. `Giscus.astro` + `[...slug].astro` integration → comments ship.
5. Workflow + docs updates.
