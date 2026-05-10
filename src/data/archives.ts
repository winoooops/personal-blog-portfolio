import { withBase } from '../lib/paths';

export type Archive = {
  yr: string;
  title: string;
  tag: string;
  href: string;
};

// Wire each archive row to a real /blog/{slug}/ page when one exists,
// otherwise to the GitHub repo. Mapping rationale:
// - Vimeflow → vimeflow-three-months-in.md (Build post)
// - llm-tui → small-rust-tui-llm.md (Tools post)
// - Lifeline / wskills / nvim — no dedicated post yet, so they link
//   to their GitHub repos as the next-most-canonical destination.
export const archives: readonly Archive[] = [
  { yr: "'26", title: 'Vimeflow', tag: 'CONTROL PLANE', href: withBase('/blog/vimeflow-three-months-in/') },
  { yr: "'25", title: 'Lifeline', tag: 'AUTO HARNESS', href: 'https://github.com/winoooops/lifeline' },
  { yr: "'25", title: 'wskills', tag: 'SKILL LIBRARY', href: 'https://github.com/winoooops/wskills' },
  { yr: "'25", title: 'llm-tui', tag: 'RUST · CLI', href: withBase('/blog/small-rust-tui-llm/') },
  { yr: "'24", title: 'nvim', tag: 'DAILY DRIVER', href: 'https://github.com/winoooops/nvim' },
] as const;
