# From ReAct to /goal — what one prompt can do (LinkedIn version)

**Image attachments — upload in this order so the carousel sequence matches the [IMAGE N] markers in the body:**
1. `public/blog-assets/from-react-to-goal/react-vs-goal-loops.png` — Card C, ReAct vs /goal loop comparison (the hook image — sets up the whole essay)
2. `public/blog-assets/from-react-to-goal/two-habits-four-techniques.png` — Card A, Two Habits + Four Techniques framework
3. `public/blog-assets/from-react-to-goal/orchestrator-coder-reviewer.png` — Card D, Orchestrator/Coder/Reviewer triangle (Pure vs Paired modes)
4. `public/blog-assets/from-react-to-goal/lifeline-toolkit.png` — Card F, /lifeline toolkit overview

> LinkedIn renders images as a carousel above the post text, not inline. The [IMAGE N] markers below tell you the *narrative order* — readers scroll the carousel as they read down. The first image (Card C) is what shows in the feed preview, so it's doing the visual hook.

---

## Post body — paste this into LinkedIn

You can build OpenAI's `/goal` command for Claude Code in 50 lines of Markdown.

No new API. No new model. Just prompt engineering — and four patterns that make it bulletproof.

Here's how. 👇

[IMAGE 1 — Card C: react-vs-goal-loops.png]

In late 2022, Harrison Chase's 15-line ReAct template let an LLM stop hallucinating and use a tool. The trick was carving a slot in the prompt for an **Observation** the model couldn't fabricate.

In 2026, OpenAI's `/goal` template does the same thing for completion discipline. It carves a slot for an **Audit** — proof against real files, tests, and PR state — that has to happen before the model can declare victory.

Same design pattern. Different failure mode.

→ First we taught models to reach outside themselves for **information**.
→ Now we are teaching them to reach outside themselves for **judgment**.

[IMAGE 2 — Card A: two-habits-four-techniques.png]

@MinLiBuilds reduces the Codex prompt to **two posture habits** and **four enforcement techniques**:

1️⃣ Type your inputs — wrap untrusted content in tags, treat as data not instructions
2️⃣ Replace adverbs with noun lists — "carefully verify" is unverifiable; an enumerated checklist isn't
3️⃣ Flip the default — one sentence: "treat uncertainty as not achieved"
4️⃣ Stop ≠ complete — budget exhausted is not "done"

These are the type-system analog for prompts. They don't make the model smarter. They make whole classes of bugs structurally impossible.

[IMAGE 3 — Card D: orchestrator-coder-reviewer.png]

I rebuilt this as `/lifeline:deliver`, a Claude Code skill with two modes:

• **Pure** — Claude self-audits each iteration
• **Paired** — a separate `codex exec` process grades read-only, with no access to the conversation history

The paired mode wins because the reviewer **cannot rationalize** the coder's mistakes. It has no stake in the existing work.

[IMAGE 4 — Card F: lifeline-toolkit.png]

`/deliver` sits inside a 7-command toolkit — planner → loop → deliver → review → request-pr → upsource-review → approve-pr. End-to-end from design spec to merged PR.

The frontier of agent capability is not in the models. It is in the constraints we wrap around them.

Full write-up — paired-mode implementation, the Codex grader schema, and how this whole thing maps to Anthropic's Outcomes pattern:

👉 https://winoooops.com/blog/from-react-to-goal/

#AgenticAI #PromptEngineering #ClaudeCode #LLM #DeveloperTools

---

## Notes

- **The hook** lives in the first three lines (~210 chars) — that's the "see more" cutoff in the LinkedIn feed. "You can build OpenAI's /goal for Claude Code in 50 lines of Markdown. No new API. No new model. Just prompt engineering" is the curiosity gap.
- **Carousel order** matters: Card C is the feed thumbnail, so it does the visual hook (the side-by-side flow comparison is the most legible at thumbnail size). A, D, F follow the narrative.
- **The [IMAGE N] markers** are reading guides, not LinkedIn syntax — LinkedIn doesn't render images inline in post text. Readers scroll the image carousel as they read down.
- Body length is ~360 words. Long enough to feel substantive, short enough that the "see more" → engagement payoff still feels worth it.
- Strip the hashtags if posting as a LinkedIn Article instead of a feed post — they read as social-feed signage and feel off in long-form.
