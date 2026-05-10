---
title: "Vimeflow, three months in — what changed and what didn't."
tag: Build
date: 2026-01-22
readMin: 6
dek: Three months of Vimeflow as a daily driver. The features I kept, the ones I cut, and what shipping a desktop control plane actually feels like.
source: local
---

Three months in, Vimeflow is mostly what I expected — and the surprises are mostly about scope.

What I kept:
- The terminal-first hero. Most agent work is text in, text out. A first-class terminal session is non-negotiable.
- File browsing as a sidecar, not a primary surface. People who want a full IDE already have one.
- Git diff inline with the agent transcript. The two are not separable.

What I cut:
- A built-in editor. Tauri's WebView is fine for chrome, not for editing real code. Users want their existing editor.
- Per-agent themes. Visual differentiation didn't help anyone; just a config tax.
- Markdown rendering in agent transcripts. Agents output code in fences and they want to be copyable as text. Rich rendering got in the way.

What surprised me:
- The "live agent status" panel ended up being the feature people demo. I almost didn't ship it.
- Tauri's update story is pleasant. Users update without thinking about it.
- The Rust side of the codebase is smaller than I planned. Most of the work is in the React layer.

If I were starting over, I'd start smaller. A terminal pane, a diff pane, a status pill. Everything else is earned.
