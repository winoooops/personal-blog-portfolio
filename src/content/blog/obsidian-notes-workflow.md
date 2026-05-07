---
title: Publishing Obsidian Notes
description: How designated Obsidian notes flow into the Astro blog collection.
pubDate: 2026-05-06
tags:
  - obsidian
  - workflow
source: local
---

Keep private notes in Obsidian, then designate the ones that should become public in `obsidian.config.json`.

The sync command copies each selected note into `src/content/blog`, adds any missing blog metadata, rewrites common Obsidian wiki links, and leaves the original note untouched.

After syncing, review the generated Markdown, run the build, and commit the blog content with the rest of the site.
