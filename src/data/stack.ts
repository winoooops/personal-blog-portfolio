export type StackGroup = {
  cat: string;
  items: readonly string[];
};

export const stack: readonly StackGroup[] = [
  { cat: 'Languages', items: ['TypeScript', 'Rust', 'Python', 'Lua', 'Go'] },
  { cat: 'Agents', items: ['Claude Code', 'Codex', 'Cursor', 'Aider'] },
  { cat: 'Runtime', items: ['Node', 'Bun', 'Tauri', 'Cloudflare Workers'] },
  { cat: 'Surface', items: ['Neovim', 'tmux', 'Astro', 'Obsidian'] },
] as const;
