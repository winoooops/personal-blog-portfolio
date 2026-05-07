export type WorkDot = 'accent' | 'sun-1' | 'sun-2' | 'sand-3' | 'muted';

export type Work = {
  title: string;
  co: string;
  yr: string;
  status: string;
  line: string;
  tags: readonly string[];
  dot: WorkDot;
  href: string;
};

export const works: readonly Work[] = [
  {
    title: 'Vimeflow',
    co: 'Personal',
    yr: '26',
    status: 'Shipping',
    line: 'A control plane for coding agents — terminals, diffs, live status.',
    tags: ['TypeScript', 'React', 'Tauri'],
    dot: 'accent',
    href: 'https://github.com/winoooops/vimeflow',
  },
  {
    title: 'Lifeline',
    co: 'Personal',
    yr: '25',
    status: 'Active',
    line: 'Autonomous harness for Claude Code — paired Codex review, PR opener.',
    tags: ['Python', 'Claude API', 'GitHub Actions'],
    dot: 'sun-1',
    href: 'https://github.com/winoooops/lifeline',
  },
  {
    title: 'wskills',
    co: 'Personal',
    yr: '25',
    status: 'Maintained',
    line: 'A bilingual library of agent skills, distilled into repeatable workflows.',
    tags: ['Markdown', 'EN / 中文', 'OSS'],
    dot: 'sun-2',
    href: 'https://github.com/winoooops/wskills',
  },
  {
    title: 'llm-tui',
    co: 'Personal',
    yr: '25',
    status: 'Stable',
    line: 'A Rust terminal chat for local OpenAI-compatible LLM servers.',
    tags: ['Rust', 'Ratatui', 'CLI'],
    dot: 'sand-3',
    href: 'https://github.com/winoooops/llm-tui',
  },
  {
    title: 'nvim',
    co: 'Personal',
    yr: '24',
    status: 'Daily driver',
    line: 'A cross-platform Neovim and tmux environment for reviewing agents.',
    tags: ['Lua', 'Neovim', 'tmux'],
    dot: 'muted',
    href: 'https://github.com/winoooops/nvim',
  },
] as const;
