---
title: "Obsidian → Astro → GitHub Pages, with no extra cognitive load."
tag: Process
date: 2025-11-19
readMin: 3
dek: A three-step writing pipeline that doesn't ask me to leave Obsidian. Notes stay private until I mark them public; a small script handles the rest.
source: local
---

I write in Obsidian. I publish on GitHub Pages. The bridge is a small script that costs me almost nothing per post.

The flow:

1. Write the note privately in Obsidian like any other note.
2. When it's ready to publish, add the note's path to a single config file (`obsidian.config.json`) and run `npm run sync:obsidian`.
3. The script copies the note into the Astro content collection, rewrites Obsidian wiki-links into proper post links, and copies any embedded images into a public asset folder.

I commit the synced markdown to the repo. The Pages workflow rebuilds the site. Done.

What the design avoids on purpose:

- No live "publish from Obsidian" button. Manual sync keeps me from publishing half-thoughts.
- No private vault in the repo. The vault stays where it is — outside the project. Only listed notes are copied.
- No round-trip editing. The Astro markdown is generated and gitignored from the vault's perspective. If I want to change a published note, I edit the source in Obsidian and re-sync.

The cognitive load test: I haven't had to think about *how* to publish in months. Open Obsidian, write, sync when ready. The pipeline is invisible most of the time, which is the only sign that it's working.
