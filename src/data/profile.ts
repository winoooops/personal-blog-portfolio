export const profile = {
  name: 'Will Wang',
  role: 'Software Engineer focused on agentic AI and full-stack systems',
  location: 'Sydney, Australia',
  intro:
    'I build LLM tools, RAG workflows, orchestration graphs, and AI-in-the-loop systems with TypeScript, Node.js, Python, Rust, and pragmatic AWS architecture.',
  availability: 'Shipping clean, observable systems with strong types, small interfaces, telemetry, and security from day one.',
  contactBlurb:
    'Best for collaboration on agentic AI tooling, full-stack work, and developer-experience projects. Replies usually within a few days.',
  links: [
    { label: 'GitHub', href: 'https://github.com/winoooops' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/wei-wangcspractitioner' },
    { label: 'Email', href: 'mailto:w.wang4869@gmail.com' },
  ],
  highlights: [
    'Agentic AI: LLM tools, RAG, LangGraph, MCP, and AI-in-the-loop workflows',
    'Full-stack delivery with TypeScript, Node.js, React, GraphQL, and AWS',
    'Developer tooling for agent review, local LLMs, automation, and repeatable workflows',
  ],
} as const;

export const projectStatuses = [
  {
    title: 'Vimeflow',
    status: 'Active',
    summary:
      'A Tauri desktop control plane for coding agents, combining terminal sessions, file browsing, editor surfaces, git diffs, and live agent status.',
    stack: ['TypeScript', 'Tauri', 'Rust', 'React'],
    href: 'https://github.com/winoooops/vimeflow',
  },
  {
    title: 'Lifeline',
    status: 'Active',
    summary:
      'An autonomous harness workflow for Claude Code with a dev loop, paired Codex review, PR opener, PR finisher, and spec planner.',
    stack: ['Python', 'Claude Code', 'Codex', 'GitHub'],
    href: 'https://github.com/winoooops/lifeline',
  },
  {
    title: 'wskills',
    status: 'Maintained',
    summary:
      'An opinionated bilingual collection of AI agent skills for repeatable workflows and specialized development tasks.',
    stack: ['Python', 'AI agents', 'Skills', 'Workflows'],
    href: 'https://github.com/winoooops/wskills',
  },
  {
    title: 'llm-tui',
    status: 'Building',
    summary:
      'A Rust terminal chat interface for local OpenAI-compatible LLM servers, built incrementally with tutorial-style architecture notes.',
    stack: ['Rust', 'Ratatui', 'Tokio', 'Local LLMs'],
    href: 'https://github.com/winoooops/llm-tui',
  },
  {
    title: 'nvim',
    status: 'Maintained',
    summary:
      'A cross-platform Neovim and tmux environment optimized for reviewing agent output across macOS, Linux, and WSL2.',
    stack: ['Lua', 'Neovim', 'Tmux', 'Agent review'],
    href: 'https://github.com/winoooops/nvim',
  },
  {
    title: 'Leetcode-1001',
    status: 'Learning',
    summary:
      'A TypeScript algorithms practice repo with topic playbooks, solution folders, Jest specs, and repeatable study workflows.',
    stack: ['TypeScript', 'Jest', 'Algorithms', 'Study notes'],
    href: 'https://github.com/winoooops/Leetcode-1001',
  },
] as const;

export const skillGroups = [
  {
    category: 'Languages',
    skills: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'C#', 'Solidity'],
  },
  {
    category: 'Frontend',
    skills: ['React', 'Angular', 'Tailwind CSS', 'Vite', 'Testing Library'],
  },
  {
    category: 'Backend and Cloud',
    skills: ['Node.js', 'Next.js', '.NET', 'FastAPI', 'GraphQL', 'AWS'],
  },
  {
    category: 'AI and Agents',
    skills: ['OpenAI', 'Claude', 'LangChain', 'RAG', 'LangGraph', 'MCP'],
  },
  {
    category: 'Tooling',
    skills: ['Docker', 'Git', 'Playwright', 'Jest', 'Selenium', 'Gradle'],
  },
] as const;

export const operatingModel = [
  {
    label: 'Notes',
    detail: 'Write privately in Obsidian and mark the notes that should become public.',
  },
  {
    label: 'Sync',
    detail: 'Run the sync script to copy designated notes into the Astro blog collection.',
  },
  {
    label: 'Publish',
    detail: 'Commit to GitHub and let the Pages workflow build the static site.',
  },
] as const;
