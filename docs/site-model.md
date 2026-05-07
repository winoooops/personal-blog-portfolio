# Site Model

This project uses Astro as a static portfolio and blog.

## Editable Portfolio Data

`src/data/profile.ts` is the single place to update:

- Personal intro details
- Social/contact links
- Project status cards
- Skillset groups
- The Obsidian-to-blog operating model shown on the home page

## Blog Article Model

Blog posts are Astro content collection entries in `src/content/blog`.

Required frontmatter:

```yaml
---
title: "Article title"
description: "Short summary for cards and metadata"
pubDate: "2026-05-06"
tags:
  - topic
source: local
---
```

Optional frontmatter:

```yaml
updatedDate: "2026-05-07"
draft: true
source: obsidian
obsidianPath: "Blog/My Note.md"
```

The schema lives in `src/content.config.ts`, so malformed posts fail during `npm run build`.

## Obsidian Sync Model

Keep your vault outside the repo if you prefer. Create a private `obsidian.config.json` from `obsidian.config.example.json`, list the exact notes you want public, and run:

```sh
npm run sync:obsidian
```

The script copies selected notes into `src/content/blog`, rewrites common Obsidian wiki links, copies embedded assets into `public/obsidian-assets`, and leaves the original vault files untouched.
