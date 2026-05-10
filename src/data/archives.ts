import { withBase } from '../lib/paths';

export type Archive = {
  yr: string;
  title: string;
  tag: string;
  href: string;
};

// Each archive row links straight to the project's GitHub repo. The
// per-project blog posts are deferred until there are real notes to
// publish — the placeholder posts that previously backed Vimeflow /
// llm-tui were removed when we trimmed Notes to real essays only.
export const archives: readonly Archive[] = [
  { yr: "'26", title: 'Vimeflow', tag: 'CONTROL PLANE', href: 'https://github.com/winoooops/vimeflow' },
  { yr: "'25", title: 'Lifeline', tag: 'AUTO HARNESS', href: 'https://github.com/winoooops/lifeline' },
  { yr: "'25", title: 'wskills', tag: 'SKILL LIBRARY', href: 'https://github.com/winoooops/wskills' },
  { yr: "'25", title: 'llm-tui', tag: 'RUST · CLI', href: 'https://github.com/winoooops/llm-tui' },
  { yr: "'24", title: 'nvim', tag: 'DAILY DRIVER', href: 'https://github.com/winoooops/nvim' },
] as const;
