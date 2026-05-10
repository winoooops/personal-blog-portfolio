---
title: "什么是 Harness Engineering"
tag: Essay
lang: zh
date: 2026-05-20
readMin: 14
dek: Symphony 三人团队五个月写完一百万行代码。重点不是 Codex 多强，而是 Codex 周围的脚手架——Linter、架构边界、Reviewer agents、文档体系。
source: obsidian
obsidianPath: "winoooops/raw/sources/articles/赛博克总手摸手带你写 Harness Engineering.md"
---

> 参考来源：
> - [Harness Engineering: Leveraging Codex in an Agent-First World](https://openai.com/index/harness-engineering/)（OpenAI, 2026-02-18）
> - [Build Hour: API & Codex](https://www.youtube.com/watch?v=rhsSqr0jdFw) — Ryan Lopopolo（OpenAI/Symphony）, Mitch（Basis 联合创始人）

---

三个工程师，五个月，一百万行代码。每一行都是 Codex 写的。

这是 OpenAI Symphony 团队的数据。但真正有意思的不是 Codex 有多强——而是他们在 Codex 周围搭了什么东西，才让这件事成为可能。

他们管这叫 **Harness Engineering**。

## 你不能再靠敲键盘来推进项目了

Ryan Lopopolo 在 Build Hour 上说了一句让我印象很深的话：

> "I can't actually clack on the keyboard in order to make progress. I kind of have to step back and think at a systems level."

翻译一下：他已经没办法通过"写代码"来推进项目了。他要做的是退后一步，在系统层面去想——怎么让一个 agent 团队把活干好。

我们花了几十年优化人类开发者的生产力——IDE、自动补全、包管理器、CI/CD。Harness Engineering 是同样的思路，只不过你在优化的开发者不是人类。

这个心态转变比听起来要难。Mitch（Basis 的联合创始人）说得很直接："People need to shift from **doing** to **managing**. That's actually a very hard paradigm shift." 从亲手做到管理别人做，很多人卡在这一步。

## 差距永远在我们这边

这里有一个反直觉的认知。

当 agent 写出烂代码的时候，第一反应往往是"模型不够聪明"。但几乎所有情况下，问题出在我们没有提供足够的信息。

Ryan 讲了一个故事：两个月前，团队在 Slack 里决定用某个特定的加密库。新来的工程师不知道这个决定，Codex 更不知道——它引入了一个不同的 npm 包。这不是工程师的错，不是 Codex 的错。这个信息压根就没有被编码到系统的约束里。

![Harness 与 Codex 的知识边界](/obsidian-assets/harness-codex-knowledge-boundary.png)

这张图是整个哲学的浓缩。Codex 看不到的东西，对它来说就不存在。Google Docs 里的讨论、Slack 里的决策、你脑子里的默契——都不算数，除非你把结论提取出来，写成 markdown 放进 repo。

Ryan 的修复方式也很简单：`@codex please add guardrails to our codebase`。走开 15 分钟回来，四个 PR 等着他 review。

所以我想说的是："让 agent 再努力一点"这个思路从根本上就是错的 🙅。差距在我们这边——我们有没有把该说的说清楚、该编码的编码进去。

## Lint > 文档

那怎么把标准编码进去呢？最直觉的答案是写文档——在 AGENTS.md 里写清楚规矩。但 Symphony 团队发现了更有效的办法。

他们的 AGENTS.md 只有大概 100 行。光安全最佳实践就能写 250 行，可靠性指南又是 250 行。全塞进去的话，agent 每次启动都要读一遍，注意力被稀释，token 也浪费。

所以他们把约束编码到**不可能被忽略的地方**：

- Linter 规则在解析阶段就拒绝错误的 import
- 类型系统在编译阶段捕获架构违规
- CI 检查在构建阶段阻止越界

Agent 压根感知不到这些是"规矩"——它只知道某些写法编译不过。

一个具体的例子：agent 很喜欢"本地优化"，结果整个代码库出现了好几份 bounded concurrency helper 的副本。但只有一份是接了 OpenTelemetry 的。怎么办？写了一条 vibecoded 的 ESLint 规则——禁止这个函数在 canonical 的 `async-utils` 包之外被定义。不是在 AGENTS.md 里写"请不要复制这个函数" 🥺。是直接让它不可能发生。

**哲学：不要告诉 agent 该怎么做——让错误的做法不可能发生。**

（这和我在 Skill 文章里讲的渐进式披露是一个思路：AGENTS.md 是索引，不是百科全书。详细规则住在 linter、类型系统和 CI 里——零 token 成本，100% 执行率。）

## Code Review 变成了基础设施的反馈循环

这个部分颠覆了我的预期。

他们的 code review 流程不是人看代码。而是：

1. 主写作 agent 写完代码
2. 提交给**专门的 reviewer agent**——一个管可靠性、一个管安全、一个管产品 QA
3. Reviewer agent 留 comment
4. 主写作 agent 读 comment，修改，再提交
5. 循环直到收敛

大部分 review cycle 是 **agent-to-agent** 的。

人类做什么呢？人类 review 的不是代码，而是 **review 标准本身**。如果 reviewer agent 漏了什么，人类不会去改代码——他们会更新 reviewer agent 的指令，或者加一条新的 lint 规则。Review 循环教的是 harness，不是 agent。

Ryan 说了一句很到位的话："Codex is very patient and willing to take as many code reviews as we can throw at it, whereas I might get frustrated and just yolo merge it anyway."

Agent 的耐心超过人类。代码产出变便宜之后，merge bar 反而可以**升高**——反正重做的成本很低。这就是"throughput changes the merge philosophy"的意思：产量高了，标准才能高。

## 架构是代码级的渐进式披露

![Harness 分层架构](/obsidian-assets/harness-layered-architecture.png)

这是他们的分层架构。Utils 在最上面，独立不依赖任何人。Business Logic Domain 在中间。Types、Config、Repo 作为横切关注点在最底层。

箭头是单向的。Service 可以用 Types，但 Types 永远不能 import Service。如果 agent 试图在 Types 层引用 UI 层的东西，构建直接失败。不是因为哪个 markdown 文件说了"别这样做"，而是工具链**物理上阻止了这件事**。

Ryan 在 Q&A 里说了一句让我豁然开朗的话：

> "Being able to structure the codebase in a highly opinionated way also permits code-as-prompts to follow the same sort of progressive disclosure pattern."

**代码结构就是上下文管理。** 如果 agent 在某个业务领域工作，把旁边的模块当作不透明接口，它就不需要把整个代码库加载到上下文里。这和 SKILL.md 的加载逻辑一模一样——描述在先，细节按需加载。只不过一个是在文档层面，一个是在代码层面。

他们因为这个做了比五年前多得多的重构。因为现在架构不再是"画在白板上的理想状态"——agent 需要清晰的边界才能高效工作，所以你真的会去建这些边界，而不只是想想就算了。

全局架构必须由人来定，agent 必须遵守。但在一个模块内部，在一个层的内部——agent 有完全的自主权来做实现决策。原则是全局的，决策是局部的。

## 品味会叠加

这是整场 talk 里我最喜欢的部分。

Ryan 自己是后端架构背景。他搞不定高质量的 React 代码。后来团队招了一个深度前端架构经验的人。这个人开始把自己的知识编码进代码库——hooks 拆成单文件、小组件用 snapshot testing、文件更小方便 agent 分页加载。

然后，**所有人的** Codex 开始产出更好的前端代码。不是模型变了，是代码库里多了一个懂前端的人的品味。

每个新工程师都以独特的方式减少 slop。因为每个人都把知识投入到共享基础设施里——lint 规则、文档、reviewer agent、架构模式——所以所有人的 agent 都受益。这是一个飞轮 🔄。

产出从开始时的 0.25-0.5 个工程师当量，涨到了**每个工程师 3-10 倍**的产出。而且每加一个新团队成员，飞轮转得更快。

## 不要止步于代码库

Mitch（Basis）把这个思路推得更远。他们有两个 repo：

- **Arnold** —— 生产代码 monorepo（名字来源：ChatGPT 2023 年说 Arnold 是美国最常见的会计名字 😂）
- **Atlas** —— 公司上下文 repo（运营原则、规划文档、所有非代码内容）

Codex 两个 repo 都能读。Mitch 有一个 "Start My Day" skill，每天早上自动从个人笔记、公司 repo、代码 repo 里拉取过去 24 小时的上下文。

他们还搞了一个 `.notes` 目录——Codex 在 session 中随时把做过的决策写进去。不是只在 commit 的时候写 commit message，而是随时记录。回溯历史 commit 的时候，`.notes` 告诉你**为什么**这么实现。

文档不再是"可选的知识分享"。它是人和 agent 之间的**通信协议**。我们怎么写文档，就是 agent 怎么理解我们的工作方式。

## 所以 Harness Engineering 到底在说什么？

说到底就是一件事：**当写代码不再是瓶颈的时候，什么才是瓶颈？**

答案是脚手架。Linter 规则、架构边界、文档体系、review 流程、可观测性栈——这些东西决定了 agent 能不能持续产出高质量代码。代码本身是 agent 写的，但围绕代码的一切是人搭的。

纪律也同样重要，只是形态变了。不再是"写好代码的纪律"，而是"维护好约束的纪律"。文档要保持更新，决策要编码回 repo，不能让"那个 Slack 里说过了"变成借口。

脚手架没有纪律会腐烂。纪律没有脚手架无法扩展。

Agent 会忠实地复制它找到的任何模式。好的、坏的，一视同仁，始终如一。你的工作是确保它找到的东西值得复制。

## "Agent 生成"到底是什么意思

说到"代码库是 agent 生成的"，大部分人只想到产品代码。那只是最小的一部分。

Agent 产出的东西包括：

- **产品代码和测试** — 大家以为的那部分
- **CI 配置和发布工具链** — 代码怎么进生产环境
- **内部开发者工具** — agent 用来干活的工具
- **文档和设计历史** — 决策是怎么做的
- **Eval Harness** — 怎么判断 agent 干得好不好
- **Review 评论和回复** — 写作 agent 和 reviewer agent 之间的来回
- **管理 repo 本身的脚本** — 脚手架的脚手架
- **生产环境监控 Dashboard 定义文件** — 上线后监控什么

这就是全部的范围。每一个类别都是"代码库"的一部分，都需要清晰、一致、值得复制。

这就是为什么 Harness Engineering 不是附属品。不是"我们用了 agent，然后再加一些最佳实践"。而是**完整的开发文化**——决策怎么做、约束怎么编码、标准怎么维护——全部因为每件产物都是 agent 生产的而重新思考。

目标是什么？是**自主性**：agent 能更长时间、更稳定、更少手把手地工作。不是模型变强了，是基础变清晰了。架构、Linter、文档、Review 循环、可观测性——这些东西决定了 agent 在没人盯着的时候产出是否可信。

而这个基础不会自己长出来。是人的工作——只是形态不同。系统思维而不是代码书写。品味设定而不是任务执行。从键盘到编排层。
