---
title: Publishing Obsidian Notes
tag: Process
date: 2026-05-06
readMin: 2
dek: How designated Obsidian notes flow into the Astro posts collection.
draft: true
source: local
---

Keep private notes in Obsidian, then designate the ones that should become public in `obsidian.config.json`.

The sync command copies each selected note into `src/content/posts`, adds any missing post metadata, rewrites common Obsidian wiki links, and leaves the original note untouched.

After syncing, review the generated Markdown, run the build, and commit the post content with the rest of the site.
