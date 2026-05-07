---
title: Why I let coding agents drive — and where I keep my hands on the wheel.
tag: Essay
date: 2026-03-15
readMin: 8
featured: true
dek: A year of pairing with Claude and Codex on real shipping work. The patterns that survived, the ones that didn't, and the small rituals that make autonomous coding actually feel safe.
source: local
---

A year ago I started letting an agent drive most of the keyboard time on real shipping work. Twelve months in, the rituals that survived have very little to do with which model is best.

The first thing that changed was how I write specs. Long prose got replaced by tight, sectioned plans with file paths and line counts. The agents read them differently than I do — they cling to specifics and skim the connective tissue.

The second was where I keep my hands. I stopped reviewing the diff after every step and started reviewing the *plan* before any step. By the time the diff lands, the design is already mine.

The third was a small ritual: a single commit at the end of each feature, with a real human-written message. Per-step commits felt safer at first; in practice they fragment intent and hide the through-line. One feature, one commit, one story.

Some patterns didn't survive. Tight token-budget prompts ("be concise") just produced confidently wrong shorter answers. Long inspirational system prompts felt warm but didn't change behavior. Tests written *after* the implementation got reused as fixtures rather than rewritten as real tests.

The hands-on-the-wheel test that's worked best: if I can't predict, in one sentence, what the agent is going to do before I read the diff, I'm not actually steering. That's when I stop, write a smaller plan, and start again.
