# Personal Blog Portfolio

Astro project for a personal intro page, project-status portfolio, skillset overview, and Markdown blog that can be fed by selected Obsidian notes.

Astro is used because it is a well-known static-site framework with native Markdown/content-collection support and a simple GitHub Pages deployment path.

## Quick Start

```text
/
├── docs/site-model.md
├── scripts/sync-obsidian.mjs
├── src/content.config.ts
├── src/content/blog/
├── src/data/profile.ts
├── src/pages/
└── .github/workflows/deploy.yml
```

```sh
npm install
npm run dev
```

## Common Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Astro dev server. |
| `npm run build` | Validate content and create the production site in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run sync:obsidian` | Copy designated Obsidian notes into the blog collection. |

## Update Portfolio Details

Edit `src/data/profile.ts` to update:

- Personal name, role, intro, location, and links
- Project cards and project statuses
- Skillset categories and details
- The notes-to-blog working model

## Add Blog Articles

Create Markdown files in `src/content/blog`.

Each post needs frontmatter matching `src/content.config.ts`:

```md
---
title: "My Article"
description: "Short summary for cards and metadata."
pubDate: "2026-05-06"
tags:
  - notes
source: local
---

Article body.
```

## Connect Obsidian Notes

Create a private config file:

```sh
cp obsidian.config.example.json obsidian.config.json
```

Update `vaultPath` and the `notes` list with the exact notes to publish, then run:

```sh
npm run sync:obsidian
```

`obsidian.config.json` is gitignored because it contains your local vault path. The generated Markdown in `src/content/blog` can be reviewed, built, and committed.

The sync script supports common Obsidian syntax:

- `[[Other Note]]` becomes a blog link when that note is also configured.
- `[[Other Note|custom label]]` keeps the label.
- `![[image.png]]` copies the asset into `public/obsidian-assets`.

## GitHub Management and Deployment

This project is ready to manage in GitHub:

```sh
git add .
git commit -m "Create personal blog portfolio"
```

Push it to a GitHub repository and enable GitHub Pages with **GitHub Actions** as the source. The included workflow uses Astro's official Pages action.

For a repository URL like `https://github.com/<username>/personal-blog-portfolio`, set these repository variables or workflow environment values when you are ready to publish:

```sh
PUBLIC_SITE_URL=https://<username>.github.io
PUBLIC_BASE_PATH=/personal-blog-portfolio
```

If you use a `<username>.github.io` repository or a custom domain, you usually do not need `PUBLIC_BASE_PATH`.
