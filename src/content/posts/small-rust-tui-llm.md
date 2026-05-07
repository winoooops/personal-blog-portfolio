---
title: A small Rust TUI that talks to any OpenAI-compatible server.
tag: Tools
date: 2025-12-08
readMin: 5
dek: llm-tui is a tiny Ratatui app that connects to any OpenAI-compatible endpoint — local llama.cpp, vLLM, LM Studio, or the real OpenAI API.
source: local
---

`llm-tui` started as a weekend project to test local LLM servers without leaving the terminal. The constraint was simple: one binary, one config, any OpenAI-compatible endpoint.

The architecture is three crates:

- `core`: streaming-aware chat client over `reqwest`. Tokenization-agnostic. Talks to anything that speaks `/v1/chat/completions`.
- `tui`: Ratatui frontend. Two panes — chat scroll and input. Vim-style keybindings, no menus.
- `cli`: thin entry point with `clap` for endpoint and model selection.

Streaming was the most interesting part. Server-sent events arrive as `data: {"choices":[...]}` lines; a Tokio channel feeds chunks into the render loop, which redraws on each token without flicker if you batch-update on a 16ms tick.

What it doesn't do: tool use, vision, audio, function calling. It's a chat shell. Specialty, not platform.

What it's good for: A/B testing local models against each other on real prompts, or having a model assistant in a terminal that doesn't pull in Node, Python, or a browser. About 1200 lines total.
