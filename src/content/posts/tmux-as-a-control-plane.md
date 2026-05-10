---
title: "Tmux as a control plane: my agent review setup."
tag: Notes
date: 2026-02-12
readMin: 4
dek: A four-pane tmux layout for reviewing agent work in flight — diff on the left, terminal on the right, plan up top, watcher below.
source: local
---

I review most agent runs in a single tmux window with four panes:

- Top-left: the plan, open in nvim.
- Bottom-left: the diff, scrollable, refreshed by a `watch` loop.
- Top-right: the agent's terminal — its session, its output.
- Bottom-right: my terminal — quick `git`, `npm test`, `rg` calls without disturbing the agent.

The split is 60/40 horizontal, 70/30 vertical. The diff pane updates every two seconds with `git diff --stat HEAD` for shape and `git diff HEAD` for detail. I rebind `prefix + r` to refresh the diff manually for finer control.

What I gained: I can see the plan, the work, and the result without alt-tabbing. The only context switch is between thinking modes — review vs. test vs. plan-edit — and tmux makes those zero-cost.

What I lost: the muscle memory of a single full-screen editor. I rebuilt some of it by making the plan pane bigger when I'm in writing mode and the diff pane bigger when I'm in review mode, with `prefix + Z` to zoom either when needed.
