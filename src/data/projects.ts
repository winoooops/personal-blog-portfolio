export type Project = {
  yr: string;
  title: string;
  tag: string;
  href: string;
};

// Each project row links straight to its GitHub repo. The per-project
// blog posts are deferred until there are real notes to publish.
export const projects: readonly Project[] = [
  { yr: "'26", title: 'Vimeflow', tag: 'CONTROL PLANE', href: 'https://github.com/winoooops/vimeflow' },
  { yr: "'25", title: 'Lifeline', tag: 'AUTO HARNESS', href: 'https://github.com/winoooops/lifeline' },
  { yr: "'25", title: 'wskills', tag: 'SKILL LIBRARY', href: 'https://github.com/winoooops/wskills' },
  { yr: "'25", title: 'llm-tui', tag: 'RUST · CLI', href: 'https://github.com/winoooops/llm-tui' },
  { yr: "'24", title: 'nvim', tag: 'DAILY DRIVER', href: 'https://github.com/winoooops/nvim' },
] as const;
