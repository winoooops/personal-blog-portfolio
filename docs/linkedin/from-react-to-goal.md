# From ReAct to /goal — what one prompt can do (LinkedIn version)

**Image attachments (upload all four when posting):**
1. `public/blog-assets/from-react-to-goal/two-habits-four-techniques.png` — Two Habits, Four Techniques card
2. `public/blog-assets/from-react-to-goal/react-vs-goal-loops.png` — ReAct vs /goal loop comparison
3. `public/blog-assets/from-react-to-goal/orchestrator-coder-reviewer.png` — Orchestrator/Coder/Reviewer triangle
4. `public/blog-assets/from-react-to-goal/lifeline-toolkit.png` — /lifeline toolkit overview (seven slash commands)

---

## Post body — paste this into LinkedIn

In late 2022, Harrison Chase shipped a 15-line ReAct template that probably ran more "agents" than any other artifact of that year. It worked on GPT-3.5.

In 2026, OpenAI's Codex CLI shipped `/goal` — under 50 lines of Markdown. It works on whatever model Codex defaults to.

Same design pattern. Different failure mode.

ReAct carved out a slot in the prompt for an **Observation** the model couldn't fabricate — and external grounding became possible. `/goal` does the same trick for an **Audit** — and premature "I'm done" claims became expensive.

The frontier of agent capability is not in the models. It is in the constraints we wrap around them.

Four interface design patterns from MinLi's breakdown of the Codex prompt — applicable anywhere a model decides whether work is finished:

1️⃣ Type your inputs — wrap untrusted content in tags, treat as data
2️⃣ Replace adverbs with noun lists — "carefully verify" is unverifiable; an enumerated checklist isn't
3️⃣ Flip the default bias — one sentence: "treat uncertainty as not achieved"
4️⃣ Separate stop states from success states — budget exhausted ≠ done

These are the type-system analog for prompts. They don't make the model smarter. They make whole classes of bugs structurally impossible.

Full write-up — including the /deliver implementation, paired-mode grading with `codex exec`, and where /deliver sits in the broader /lifeline toolkit — here:

👉 https://winoooops.com/blog/from-react-to-goal/

#AgenticAI #PromptEngineering #LLM #DeveloperTools #HarnessEngineering

---

## Notes

- Length: ~220 words, well under LinkedIn's "see more" cutoff (~210 chars in the first three lines is the visible preview)
- Suggested image order in carousel: Card C (loop comparison) first → Card A (Two Habits) → Card D (triangle) → Card F (toolkit)
- Or: post Card A + C as a single image carousel, save D + F for follow-up comments
- The blog URL is the call-to-action — keep it as the final clickable item
- Hashtags placed last so they don't break the narrative flow
