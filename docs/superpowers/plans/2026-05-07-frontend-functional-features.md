# Frontend Functional Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live GitHub project data, a working contact form, and giscus blog comments to the Astro static site without giving up GitHub Pages hosting.

**Architecture:** GitHub data layer is a typed module (`src/lib/github.ts`) with build-time fetch and a 1-hour file cache. Contact form is one Astro component posting JSON to Web3Forms. Comments are one Astro component wrapping the giscus loader. Each feature degrades silently when its env config is missing.

**Tech Stack:** Astro 6, TypeScript, native `fetch`, scoped Astro `<script>`, Web3Forms (form delivery), giscus.app (comments), GitHub REST API (project stats).

**Spec:** `docs/superpowers/specs/2026-05-06-frontend-functional-features-design.md`

**Commit policy:** User has asked to commit once at the end of the implementation, not per task. Each task ends with a build verification, not a commit. Task 16 is the single final commit.

---

## File Structure

### New files

| Path | Responsibility |
|---|---|
| `src/lib/github.ts` | Parse repo URLs, cache repo stats, fetch from GitHub API, enrich project list. |
| `src/components/ContactForm.astro` | Markup + scoped script for client-side validation and Web3Forms submit. |
| `src/components/Giscus.astro` | Wrapper that emits the giscus loader script using `PUBLIC_GISCUS_*` env vars. |
| `src/pages/contact.astro` | `/contact/` route — hero + ContactForm + sidebar of `profile.links`. |
| `src/pages/contact-success.astro` | JS-disabled fallback page Web3Forms redirects to. |
| `.env.example` | Documents every env var the build reads. |

### Modified files

| Path | Change |
|---|---|
| `src/data/profile.ts` | Add `contactBlurb` string under `profile`. |
| `src/components/ProjectCard.astro` | Accept optional `live` prop; render badge row when present. |
| `src/pages/index.astro` | Call `enrichProjects(projectStatuses)`; pass augmented array to `ProjectCard`. |
| `src/pages/blog/[...slug].astro` | Append `<Giscus />` block after the `.prose` div. |
| `src/layouts/BaseLayout.astro` | Add `/contact/` link to nav. |
| `src/styles/global.css` | Append form styles, project-meta badge styles, comments-aside styles. |
| `.gitignore` | Add `.cache/` and `.env`. |
| `.github/workflows/deploy.yml` | Pass `PUBLIC_WEB3FORMS_KEY`, `PUBLIC_GISCUS_*`, and `GITHUB_TOKEN` to build. |
| `README.md` | New "Dynamic features" section listing env vars and one-time setup. |
| `AGENTS.md` | Mirror env var list and validation expectations. |

---

## Task 1: Add .gitignore entries and .env.example

**Files:**
- Modify: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Read current .gitignore**

Run: `cat .gitignore`
Expected: existing content. Confirm `.cache/` and `.env` aren't listed.

- [ ] **Step 2: Append cache + env entries to .gitignore**

Append these lines to `.gitignore`:

```
# Build-time caches
.cache/

# Local env (PUBLIC_* vars for dev — production reads from GitHub Actions)
.env
.env.local
```

- [ ] **Step 3: Create .env.example**

Create `.env.example` with this content:

```sh
# Web3Forms — get a free access key at https://web3forms.com (no signup).
# Public-by-design; security model is origin allowlist on web3forms.com.
PUBLIC_WEB3FORMS_KEY=

# giscus — set up at https://giscus.app after enabling Discussions on the repo.
# All four are required; if any are missing, the comments block is hidden.
PUBLIC_GISCUS_REPO=
PUBLIC_GISCUS_REPO_ID=
PUBLIC_GISCUS_CATEGORY=
PUBLIC_GISCUS_CATEGORY_ID=

# Optional: increases unauthenticated GitHub API rate limit during local dev.
# CI does not need this set explicitly — GitHub Actions exposes GITHUB_TOKEN automatically.
GITHUB_TOKEN=
```

- [ ] **Step 4: Verify build still passes**

Run: `npm run build`
Expected: build succeeds (these files are not consumed yet).

---

## Task 2: Implement `src/lib/github.ts` URL parser

**Files:**
- Create: `src/lib/github.ts`

- [ ] **Step 1: Create file with URL parser only**

Create `src/lib/github.ts`:

```ts
const GITHUB_URL_RE =
  /^https?:\/\/github\.com\/([^/]+)\/([^/?#]+?)(?:\.git)?\/?(?:[?#].*)?$/;

export type RepoRef = { owner: string; repo: string };

export function parseGitHubUrl(url: string | undefined): RepoRef | null {
  if (!url) return null;
  const match = url.match(GITHUB_URL_RE);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
```

- [ ] **Step 2: Verify the regex with a node one-liner**

The regex itself is the only thing worth checking — the helper just wraps `String.prototype.match`. Run from the project root:

```bash
node -e '
const re = /^https?:\/\/github\.com\/([^\/]+)\/([^\/?#]+?)(?:\.git)?\/?(?:[?#].*)?$/;
const cases = [
  ["https://github.com/winoooops/vimeflow", ["winoooops","vimeflow"]],
  ["https://github.com/winoooops/vimeflow/", ["winoooops","vimeflow"]],
  ["https://github.com/winoooops/vimeflow.git", ["winoooops","vimeflow"]],
  ["https://example.com", null],
  ["", null],
];
let failed = 0;
for (const [u, expected] of cases) {
  const m = u.match(re);
  const got = m ? [m[1], m[2]] : null;
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  console.log(ok ? "PASS" : "FAIL", JSON.stringify({u, got, expected}));
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
'
```

Expected: 5 lines all starting with `PASS`. Exit code 0.

If any FAIL, fix the regex in `src/lib/github.ts` to match, then re-run.

- [ ] **Step 3: Verify build still passes**

Run: `npm run build`
Expected: build succeeds. The new file isn't imported anywhere yet so it just compiles.

---

## Task 3: Add cache read/write helpers to `src/lib/github.ts`

**Files:**
- Modify: `src/lib/github.ts`

- [ ] **Step 1: Append cache helpers to the file**

Add to the end of `src/lib/github.ts`:

```ts
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export type RepoStats = {
  stars: number;
  lastCommit: string;
  language: string | null;
};

type CacheEntry = { stats: RepoStats; fetchedAt: number };
type CacheFile = Record<string, CacheEntry>;

const CACHE_PATH = resolve(process.cwd(), '.cache/github.json');
const CACHE_TTL_MS = 60 * 60 * 1000;

async function readCache(): Promise<CacheFile> {
  try {
    const raw = await readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw) as CacheFile;
  } catch {
    return {};
  }
}

async function writeCache(data: CacheFile): Promise<void> {
  await mkdir(dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(data, null, 2));
}

function cacheKey(ref: RepoRef): string {
  return `${ref.owner}/${ref.repo}`;
}

function isFresh(entry: CacheEntry | undefined): entry is CacheEntry {
  return !!entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds. Imports resolve, no type errors.

---

## Task 4: Add `fetchRepoStats` to `src/lib/github.ts`

**Files:**
- Modify: `src/lib/github.ts`

- [ ] **Step 1: Append fetcher**

Add to the end of `src/lib/github.ts`:

```ts
type GitHubRepoResponse = {
  stargazers_count: number;
  pushed_at: string;
  language: string | null;
};

export async function fetchRepoStats(
  ref: RepoRef,
): Promise<RepoStats | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'personal-blog-portfolio-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}`,
      { headers },
    );
    if (!res.ok) {
      console.warn(
        `[github] ${ref.owner}/${ref.repo} → ${res.status} ${res.statusText}`,
      );
      return null;
    }
    const body = (await res.json()) as GitHubRepoResponse;
    return {
      stars: body.stargazers_count,
      lastCommit: body.pushed_at,
      language: body.language,
    };
  } catch (err) {
    console.warn(`[github] ${ref.owner}/${ref.repo} fetch error:`, err);
    return null;
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

---

## Task 5: Add `enrichProjects` to `src/lib/github.ts`

**Files:**
- Modify: `src/lib/github.ts`

- [ ] **Step 1: Append enricher**

Add to the end of `src/lib/github.ts`:

```ts
export type Project = {
  title: string;
  status: string;
  summary: string;
  stack: readonly string[];
  href: string;
};

export type LiveProject = Project & { live?: RepoStats };

export async function enrichProjects(
  projects: readonly Project[],
): Promise<LiveProject[]> {
  const cache = await readCache();
  const cacheUpdated: CacheFile = { ...cache };

  const result = await Promise.all(
    projects.map(async (project) => {
      const ref = parseGitHubUrl(project.href);
      if (!ref) return { ...project };

      const key = cacheKey(ref);
      const cached = cache[key];
      if (isFresh(cached)) {
        return { ...project, live: cached.stats };
      }

      const stats = await fetchRepoStats(ref);
      if (!stats) return { ...project };

      cacheUpdated[key] = { stats, fetchedAt: Date.now() };
      return { ...project, live: stats };
    }),
  );

  await writeCache(cacheUpdated);
  return result;
}
```

- [ ] **Step 2: Verify the type matches profile.ts**

Run: `grep -n "summary" src/data/profile.ts | head -3`
Expected: confirms each project has `title, status, summary, stack, href` — already does.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

---

## Task 6: Add `contactBlurb` to `src/data/profile.ts`

**Files:**
- Modify: `src/data/profile.ts:1-18` (the `profile` const)

- [ ] **Step 1: Read current profile**

Run: `head -20 src/data/profile.ts`

- [ ] **Step 2: Insert `contactBlurb` after `availability`**

Edit `src/data/profile.ts`. Replace:

```ts
  availability: 'Shipping clean, observable systems with strong types, small interfaces, telemetry, and security from day one.',
  links: [
```

With:

```ts
  availability: 'Shipping clean, observable systems with strong types, small interfaces, telemetry, and security from day one.',
  contactBlurb:
    'Best for collaboration on agentic AI tooling, full-stack work, and developer-experience projects. Replies usually within a few days.',
  links: [
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

---

## Task 7: Update `src/components/ProjectCard.astro` to accept `live` prop

**Files:**
- Modify: `src/components/ProjectCard.astro` (entire file)

- [ ] **Step 1: Replace the file contents**

Overwrite `src/components/ProjectCard.astro` with:

```astro
---
import type { RepoStats } from '../lib/github';

interface Props {
  project: {
    title: string;
    status: string;
    summary: string;
    stack: readonly string[];
    href: string;
  };
  live?: RepoStats;
}

const { project, live } = Astro.props;

function relativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diff = now - then;
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diff / day);
  if (days < 1) return 'updated today';
  if (days < 7) return `updated ${days}d ago`;
  if (days < 30) return `updated ${Math.floor(days / 7)}w ago`;
  if (days < 365) return `updated ${Math.floor(days / 30)}mo ago`;
  return `updated ${Math.floor(days / 365)}y ago`;
}
---

<article class="project-card">
  <div class="project-heading">
    <h3>{project.title}</h3>
    <span>{project.status}</span>
  </div>
  <p>{project.summary}</p>
  {live && (
    <div class="project-meta" aria-label={`Live stats for ${project.title}`}>
      <span>★ {live.stars}</span>
      <span>{relativeTime(live.lastCommit)}</span>
      {live.language && <span>{live.language}</span>}
    </div>
  )}
  <ul class="tag-list" aria-label={`Stack for ${project.title}`}>
    {project.stack.map((item) => <li>{item}</li>)}
  </ul>
  {project.href && <a class="text-link" href={project.href}>View project</a>}
</article>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds. No live data flows through yet, so cards render exactly as before.

---

## Task 8: Wire `enrichProjects` into `src/pages/index.astro`

**Files:**
- Modify: `src/pages/index.astro:1-12` (frontmatter + project loop)

- [ ] **Step 1: Replace import + frontmatter**

In `src/pages/index.astro`, replace:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { operatingModel, profile, projectStatuses, skillGroups } from '../data/profile';
import { withBase } from '../lib/paths';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);
---
```

With:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { operatingModel, profile, projectStatuses, skillGroups } from '../data/profile';
import { enrichProjects } from '../lib/github';
import { withBase } from '../lib/paths';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);

const liveProjects = await enrichProjects(projectStatuses);
---
```

- [ ] **Step 2: Replace the project loop**

In the same file, replace:

```astro
        {projectStatuses.map((project) => <ProjectCard project={project} />)}
```

With:

```astro
        {liveProjects.map((project) => (
          <ProjectCard project={project} live={project.live} />
        ))}
```

- [ ] **Step 3: Run `npm run build` and watch for the GitHub fetch**

Run: `npm run build 2>&1 | grep -E "github|build complete|error" | head -20`
Expected: build succeeds. If GitHub returns errors for any repo, you'll see `[github] owner/repo → 4xx …` warnings — those are non-fatal.

- [ ] **Step 4: Verify cache file was written**

Run: `cat .cache/github.json | head -5`
Expected: JSON with at least one `winoooops/...` entry containing `stars`, `lastCommit`, `language`, `fetchedAt`.

- [ ] **Step 5: Verify rendered HTML contains a star badge**

Run: `grep -o 'class="project-meta"' dist/index.html | head -1`
Expected: `class="project-meta"` (at least one occurrence).

---

## Task 9: Append project-meta styles to `src/styles/global.css`

**Files:**
- Modify: `src/styles/global.css` (append at end of file, before final `}` of last media query if any)

- [ ] **Step 1: Append styles**

Append to `src/styles/global.css`:

```css
.project-meta {
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  font-size: 0.82rem;
  font-weight: 700;
  gap: 14px;
  margin: -4px 0 0;
}

.project-meta span {
  align-items: center;
  display: inline-flex;
  gap: 4px;
}

.project-meta span + span::before {
  color: var(--line);
  content: "·";
  margin-right: 10px;
}
```

- [ ] **Step 2: Verify build + visual sanity check via grep**

Run: `npm run build && grep -o 'project-meta' dist/index.html | wc -l`
Expected: a number ≥ 6 (one badge row per project card that returned live data; class is referenced once per row).

---

## Task 10: Build `src/components/ContactForm.astro`

**Files:**
- Create: `src/components/ContactForm.astro`

- [ ] **Step 1: Create the component**

Create `src/components/ContactForm.astro`:

```astro
---
const accessKey = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '';
const successUrl = `${import.meta.env.BASE_URL ?? '/'}contact-success/`.replace(/\/+/g, '/');
const enabled = Boolean(accessKey);
---

<form
  class="contact-form"
  action="https://api.web3forms.com/submit"
  method="POST"
  data-enabled={enabled ? 'true' : 'false'}
>
  <input type="hidden" name="access_key" value={accessKey} />
  <input type="hidden" name="redirect" value={successUrl} />
  <input type="hidden" name="from_name" value="personal-blog-portfolio contact form" />
  <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" />
  <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" />

  <label>
    <span>Name</span>
    <input type="text" name="name" required maxlength="80" autocomplete="name" />
    <em data-error="name"></em>
  </label>

  <label>
    <span>Email</span>
    <input type="email" name="email" required autocomplete="email" />
    <em data-error="email"></em>
  </label>

  <label>
    <span>Subject <small>(optional)</small></span>
    <input type="text" name="subject" maxlength="120" />
  </label>

  <label>
    <span>Message</span>
    <textarea name="message" required rows="6" maxlength="2000"></textarea>
    <em data-error="message"></em>
  </label>

  <p class="contact-status" role="status" aria-live="polite"></p>

  <button type="submit" class="button primary" disabled={!enabled}>
    {enabled ? 'Send message' : 'Form unavailable — set PUBLIC_WEB3FORMS_KEY'}
  </button>
</form>

<script>
  const form = document.querySelector<HTMLFormElement>('.contact-form');
  if (form && form.dataset.enabled === 'true') {
    const status = form.querySelector<HTMLElement>('.contact-status')!;
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const buttonText = button.textContent ?? 'Send';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = '';
      status.dataset.tone = '';
      button.disabled = true;
      button.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');

      const data = Object.fromEntries(new FormData(form).entries());

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(data),
        });
        const body = await res.json().catch(() => ({}));

        if (res.ok && body.success) {
          form.innerHTML =
            '<p class="contact-success">Thanks — I\'ll reply soon.</p>';
          return;
        }
        status.textContent =
          body.message || `Send failed (${res.status}). Try again?`;
        status.dataset.tone = 'error';
      } catch (err) {
        status.textContent = 'Network error. Check your connection and try again.';
        status.dataset.tone = 'error';
      } finally {
        button.disabled = false;
        button.textContent = buttonText;
        form.removeAttribute('aria-busy');
      }
    });
  }
</script>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds. The component isn't routed yet, so nothing in `dist/` references it.

---

## Task 11: Append form styles to `src/styles/global.css`

**Files:**
- Modify: `src/styles/global.css` (append)

- [ ] **Step 1: Append styles**

Append to `src/styles/global.css`:

```css
.contact-form {
  display: grid;
  gap: 18px;
  max-width: 560px;
}

.contact-form label {
  display: grid;
  gap: 6px;
  font-weight: 700;
  font-size: 0.92rem;
}

.contact-form label span small {
  color: var(--muted);
  font-weight: 600;
}

.contact-form input[type='text'],
.contact-form input[type='email'],
.contact-form textarea {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  font: inherit;
  padding: 10px 12px;
  width: 100%;
}

.contact-form input[type='text']:focus,
.contact-form input[type='email']:focus,
.contact-form textarea:focus {
  border-color: var(--accent);
  outline: 2px solid rgba(31, 122, 104, 0.25);
  outline-offset: 1px;
}

.contact-form em[data-error] {
  color: #b03030;
  font-size: 0.82rem;
  font-style: normal;
  min-height: 1em;
}

.contact-form .hp {
  height: 0;
  left: -9999px;
  position: absolute;
  width: 0;
}

.contact-form button[disabled] {
  cursor: not-allowed;
  opacity: 0.65;
}

.contact-status {
  margin: 0;
  min-height: 1.2em;
}

.contact-status[data-tone='error'] {
  color: #b03030;
  font-weight: 700;
}

.contact-success {
  background: rgba(31, 122, 104, 0.1);
  border-left: 4px solid var(--accent);
  color: var(--accent-dark);
  font-weight: 700;
  margin: 0;
  padding: 16px 18px;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

---

## Task 12: Create `src/pages/contact.astro`

**Files:**
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Create the page**

Create `src/pages/contact.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ContactForm from '../components/ContactForm.astro';
import { profile } from '../data/profile';
---

<BaseLayout title="Contact" description={profile.contactBlurb}>
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Contact</p>
      <h1>Get in touch</h1>
      <p>{profile.contactBlurb}</p>
    </div>
  </section>

  <section class="section">
    <div class="container split">
      <div>
        <ContactForm />
      </div>
      <aside class="contact-sidebar" aria-labelledby="other-channels">
        <h2 id="other-channels">Other channels</h2>
        <ul>
          {profile.links.map((link) => (
            <li><a class="text-link" href={link.href}>{link.label}</a></li>
          ))}
        </ul>
      </aside>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Add sidebar styles**

Append to `src/styles/global.css`:

```css
.contact-sidebar {
  border-left: 4px solid var(--accent);
  padding: 4px 0 4px 20px;
}

.contact-sidebar h2 {
  font-size: 1.1rem;
  margin: 0 0 12px;
}

.contact-sidebar ul {
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 3: Verify build produces the page**

Run: `npm run build && ls dist/contact/`
Expected: `index.html` exists in `dist/contact/`.

---

## Task 13: Create `src/pages/contact-success.astro`

**Files:**
- Create: `src/pages/contact-success.astro`

- [ ] **Step 1: Create the page**

Create `src/pages/contact-success.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { withBase } from '../lib/paths';
---

<BaseLayout title="Thanks" description="Your message has been received.">
  <section class="page-hero">
    <div class="container">
      <p class="eyebrow">Contact</p>
      <h1>Thanks — message received</h1>
      <p>I'll reply soon. In the meantime, you can keep reading.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <p>
        <a class="button primary" href={withBase('/blog/')}>Read the blog</a>
        <a class="button secondary" href={withBase('/')}>Home</a>
      </p>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify build produces the page**

Run: `npm run build && ls dist/contact-success/`
Expected: `index.html` exists.

---

## Task 14: Add `/contact/` link to `src/layouts/BaseLayout.astro`

**Files:**
- Modify: `src/layouts/BaseLayout.astro:32-37`

- [ ] **Step 1: Add the nav link**

In `src/layouts/BaseLayout.astro`, replace:

```astro
      <nav class="site-nav" aria-label="Primary navigation">
        <a href={withBase('/')}>Home</a>
        <a href={withBase('/blog/')}>Blog</a>
        <a href={withBase('/#projects')}>Projects</a>
        <a href={withBase('/#skills')}>Skills</a>
      </nav>
```

With:

```astro
      <nav class="site-nav" aria-label="Primary navigation">
        <a href={withBase('/')}>Home</a>
        <a href={withBase('/blog/')}>Blog</a>
        <a href={withBase('/#projects')}>Projects</a>
        <a href={withBase('/#skills')}>Skills</a>
        <a href={withBase('/contact/')}>Contact</a>
      </nav>
```

- [ ] **Step 2: Verify build**

Run: `npm run build && grep -o 'href="[^"]*contact/"' dist/index.html | head -1`
Expected: a match showing the resolved `/contact/` URL.

---

## Task 15: Build `src/components/Giscus.astro`

**Files:**
- Create: `src/components/Giscus.astro`

- [ ] **Step 1: Create the component**

Create `src/components/Giscus.astro`:

```astro
---
const repo = import.meta.env.PUBLIC_GISCUS_REPO;
const repoId = import.meta.env.PUBLIC_GISCUS_REPO_ID;
const category = import.meta.env.PUBLIC_GISCUS_CATEGORY;
const categoryId = import.meta.env.PUBLIC_GISCUS_CATEGORY_ID;

const enabled = Boolean(repo && repoId && category && categoryId);
---

{enabled ? (
  <script
    src="https://giscus.app/client.js"
    data-repo={repo}
    data-repo-id={repoId}
    data-category={category}
    data-category-id={categoryId}
    data-mapping="pathname"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="bottom"
    data-theme="light"
    data-lang="en"
    data-loading="lazy"
    crossorigin="anonymous"
    async
  ></script>
) : (
  <p class="comments-disabled">
    Comments are disabled in this build (missing giscus configuration).
  </p>
)}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

---

## Task 16: Wire `<Giscus />` into `src/pages/blog/[...slug].astro`

**Files:**
- Modify: `src/pages/blog/[...slug].astro`

- [ ] **Step 1: Add import and aside**

In `src/pages/blog/[...slug].astro`, replace:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { withBase } from '../../lib/paths';
```

With:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Giscus from '../../components/Giscus.astro';
import { withBase } from '../../lib/paths';
```

Then replace:

```astro
    <div class="prose">
      <Content />
    </div>
  </article>
</BaseLayout>
```

With:

```astro
    <div class="prose">
      <Content />
    </div>
    <aside class="comments" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments</h2>
      <Giscus />
    </aside>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Append comments styles**

Append to `src/styles/global.css`:

```css
.comments {
  border-top: 1px solid var(--line);
  margin-top: clamp(48px, 8vw, 80px);
  padding-top: 32px;
}

.comments h2 {
  font-size: 1.4rem;
  margin: 0 0 18px;
}

.comments-disabled {
  color: var(--muted);
  font-style: italic;
  margin: 0;
}
```

- [ ] **Step 3: Verify build emits the aside**

Run: `npm run build && grep -o 'class="comments"' dist/blog/start-here/index.html | head -1`
Expected: `class="comments"` appears in the output.

---

## Task 17: Pass new env vars through `.github/workflows/deploy.yml`

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Read current workflow**

Run: `cat .github/workflows/deploy.yml`

- [ ] **Step 2: Replace the build job's `env:` block**

In `.github/workflows/deploy.yml`, replace:

```yaml
    env:
      PUBLIC_SITE_URL: ${{ vars.PUBLIC_SITE_URL }}
      PUBLIC_BASE_PATH: ${{ vars.PUBLIC_BASE_PATH }}
```

With:

```yaml
    env:
      PUBLIC_SITE_URL: ${{ vars.PUBLIC_SITE_URL }}
      PUBLIC_BASE_PATH: ${{ vars.PUBLIC_BASE_PATH }}
      PUBLIC_WEB3FORMS_KEY: ${{ vars.PUBLIC_WEB3FORMS_KEY }}
      PUBLIC_GISCUS_REPO: ${{ vars.PUBLIC_GISCUS_REPO }}
      PUBLIC_GISCUS_REPO_ID: ${{ vars.PUBLIC_GISCUS_REPO_ID }}
      PUBLIC_GISCUS_CATEGORY: ${{ vars.PUBLIC_GISCUS_CATEGORY }}
      PUBLIC_GISCUS_CATEGORY_ID: ${{ vars.PUBLIC_GISCUS_CATEGORY_ID }}
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

(`GITHUB_TOKEN` uses `secrets.*` because it's auto-provided; everything else uses `vars.*` which the user sets in repo settings.)

- [ ] **Step 3: YAML lint sanity check**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"`
Expected: no output (valid YAML). If `python3` isn't available, skip — Actions will validate on push.

---

## Task 18: Update `README.md` with dynamic-features setup

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Insert a new section above the GitHub deployment section**

Use Edit to replace this exact string in `README.md`:

```
## GitHub Management and Deployment
```

with this exact string (the new section followed by a blank line and the original heading):

```markdown
## Dynamic Features Setup

This site has three dynamic features that read configuration from environment variables. All are optional — if a variable is missing, the corresponding feature degrades silently.

### Live GitHub project data

Project cards on the home page show stars, last-commit recency, and primary language pulled from the GitHub REST API at build time.

- No setup required. The build runs unauthenticated unless `GITHUB_TOKEN` is set.
- The 60 req/hr unauthenticated limit is enough for the current project list. CI uses the auto-provided `GITHUB_TOKEN`, which raises the limit to 5000/hr.
- Build-time results are cached in `.cache/github.json` for one hour to keep `npm run dev` fast. The cache directory is gitignored.

### Contact form (Web3Forms)

The `/contact/` page posts to [Web3Forms](https://web3forms.com), which forwards messages to your email.

1. Visit https://web3forms.com and submit your email — they reply with an access key. No account required.
2. Add the key to `.env`:

   ```sh
   PUBLIC_WEB3FORMS_KEY=your-access-key
   ```

3. For production, set `PUBLIC_WEB3FORMS_KEY` as a repository **variable** (not secret — Web3Forms keys are designed to ship publicly).

If the key is missing, the form renders with a disabled submit button.

### Comments (giscus)

Each blog post has a giscus-powered comments widget backed by GitHub Discussions.

1. Make this repository public.
2. Settings → Features → enable **Discussions**.
3. Create a Discussion category named **Comments** of type **Announcement**.
4. Install the giscus app on the repository: https://github.com/apps/giscus
5. Visit https://giscus.app, enter the repo and category, copy the four IDs into `.env`:

   ```sh
   PUBLIC_GISCUS_REPO=username/personal-blog-portfolio
   PUBLIC_GISCUS_REPO_ID=...
   PUBLIC_GISCUS_CATEGORY=Comments
   PUBLIC_GISCUS_CATEGORY_ID=...
   ```

6. Set the same four as repository **variables** for production.

If any are missing, the comments block is replaced by a single line noting comments are disabled in this build.

### Environment variable summary

See `.env.example` for the full list. None of the `PUBLIC_*` values are secrets — security models for both Web3Forms and giscus rely on origin allowlists.

## GitHub Management and Deployment
```

- [ ] **Step 2: Verify README still renders sensibly**

Run: `grep -n "^## " README.md`
Expected: section headers in a sensible order including `## Dynamic Features Setup` between `## Connect Obsidian Notes` and `## GitHub Management and Deployment`.

---

## Task 19: Update `AGENTS.md` with new env vars and validation expectations

**Files:**
- Modify: `AGENTS.md:24` (the testing section)

- [ ] **Step 1: Replace the testing guidelines section**

In `AGENTS.md`, replace:

```markdown
## Testing Guidelines

No dedicated test framework is configured yet. Treat `npm run build` as the required validation step before committing because it checks Astro compilation and content frontmatter. For blog posts, verify `title`, `description`, `pubDate`, optional `updatedDate`, `tags`, `draft`, and `source` against `src/content.config.ts`.
```

With:

```markdown
## Testing Guidelines

No dedicated test framework is configured. Treat `npm run build` as the required validation step before committing because it checks Astro compilation, content frontmatter, and the build-time GitHub fetch. For blog posts, verify `title`, `description`, `pubDate`, optional `updatedDate`, `tags`, `draft`, and `source` against `src/content.config.ts`.

`src/lib/github.ts` runs during every build and writes `.cache/github.json` (gitignored). API failures log warnings but never fail the build — un-augmented project cards are the graceful-degradation path.

## Environment Variables

The build reads these from process env. All are optional; missing values disable the corresponding feature without breaking the build. See `.env.example` for the full list.

| Var | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Site origin (used for absolute URLs and OG meta). |
| `PUBLIC_BASE_PATH` | Pages subpath when deploying to `<user>.github.io/<repo>`. |
| `PUBLIC_WEB3FORMS_KEY` | Contact form delivery key. Public-by-design. |
| `PUBLIC_GISCUS_REPO` / `PUBLIC_GISCUS_REPO_ID` / `PUBLIC_GISCUS_CATEGORY` / `PUBLIC_GISCUS_CATEGORY_ID` | giscus configuration. All four required to enable comments. |
| `GITHUB_TOKEN` | Optional — bumps unauth GitHub API limit during local builds. CI provides this automatically via `secrets.GITHUB_TOKEN`. |
```

- [ ] **Step 2: Verify file**

Run: `head -50 AGENTS.md`
Expected: the new sections show up cleanly.

---

## Task 20: End-to-end validation

**Files:** none — verification only.

- [ ] **Step 1: Build with no env vars set (graceful degradation path)**

```bash
unset PUBLIC_WEB3FORMS_KEY PUBLIC_GISCUS_REPO PUBLIC_GISCUS_REPO_ID \
  PUBLIC_GISCUS_CATEGORY PUBLIC_GISCUS_CATEGORY_ID GITHUB_TOKEN
rm -rf dist .cache
npm run build
```

Expected: build succeeds. GitHub badges may or may not appear depending on whether the unauth fetch worked.

Verify graceful degradation:

```bash
grep -o 'Form unavailable' dist/contact/index.html | head -1
grep -o 'Comments are disabled' dist/blog/start-here/index.html | head -1
```

Expected: both grep matches succeed.

- [ ] **Step 2: Build with all env vars set (happy path)**

Create a temporary `.env`:

```sh
PUBLIC_WEB3FORMS_KEY=test-key-not-real
PUBLIC_GISCUS_REPO=winoooops/personal-blog-portfolio
PUBLIC_GISCUS_REPO_ID=R_kgDOTEST
PUBLIC_GISCUS_CATEGORY=Comments
PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOTEST
```

(Astro auto-loads `.env` for `PUBLIC_*` values.)

```bash
rm -rf dist
npm run build
```

Verify the form is enabled and giscus loader is present:

```bash
grep -o 'name="access_key" value="test-key-not-real"' dist/contact/index.html | head -1
grep -o 'src="https://giscus.app/client.js"' dist/blog/start-here/index.html | head -1
```

Expected: both grep matches succeed.

- [ ] **Step 3: Manual smoke test on `npm run preview`**

```bash
npm run preview -- --port 4322
```

Open `http://localhost:4322` and check, in this order:
- Home: project cards show star count + "updated N ago" + language for the 6 repos.
- `/contact/`: form renders, all fields present, submit button is "Send message" (not disabled).
- `/contact/`: try submitting with empty Name — browser blocks. Try a bad email — same. Try a fully-formed message — fetch hits Web3Forms with the test key (will get a 4xx from Web3Forms because the key is fake; that's fine, you'll see the inline error message render).
- Blog post: scroll to bottom, see "Comments" heading, then giscus iframe attempting to load (will show its own error inside because the test repo IDs are fake — that's expected).
- Mobile (≤ 520px in DevTools): contact `.split` collapses to one column, form fields full-width, project-meta wraps cleanly.

- [ ] **Step 4: Remove the test `.env`**

```bash
rm -f .env
```

- [ ] **Step 5: Final clean build before committing**

```bash
rm -rf dist .cache
npm run build
```

Expected: succeeds. `.cache/github.json` is regenerated.

- [ ] **Step 6: Single commit for the whole feature**

Per the user's preference, commit everything at once:

```bash
git add .gitignore .env.example src/ docs/ README.md AGENTS.md .github/workflows/deploy.yml
git status
git -c commit.gpgsign=false commit -m "$(cat <<'EOF'
Add dynamic features: live GitHub stats, contact form, blog comments

- src/lib/github.ts fetches repo stats at build with 1h file cache;
  errors log warnings without failing the build.
- /contact route + ContactForm component posts to Web3Forms; falls
  back to plain POST + redirect if JS is disabled.
- Giscus component on blog detail pages; configured via PUBLIC_GISCUS_*
  env vars, hides itself when any are missing.
- Workflow + README + AGENTS document the new env vars and one-time
  setup for Web3Forms and giscus.app.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7: Verify commit**

```bash
git log --oneline -3
git status
```

Expected: a new commit on top of the spec commit; working tree clean (or with only the regenerated `.cache/` and `dist/` directories, both gitignored).
