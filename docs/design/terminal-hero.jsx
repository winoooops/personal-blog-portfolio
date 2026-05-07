// Reusable animated terminal component for the hero
// Props: theme = 'cream' | 'editorial' | 'dark'
const TERMINAL_LINES = [
  { kind: 'cmd', text: 'cd ~/work/agentic-ai && ls -la' },
  { kind: 'out', text: 'vimeflow/    lifeline/    wskills/    llm-tui/' },
  { kind: 'cmd', text: 'cat now.md' },
  { kind: 'out', text: '# Currently shipping' },
  { kind: 'out', text: '- LLM tools, RAG workflows, LangGraph orchestration' },
  { kind: 'out', text: '- Tauri desktop control plane for coding agents' },
  { kind: 'out', text: '- Local LLMs in Rust, agent review tooling' },
  { kind: 'cmd', text: 'whoami --verbose' },
  { kind: 'out', text: 'will wang · sydney · software engineer' },
  { kind: 'cmd', text: 'git log --oneline -3' },
  { kind: 'out', text: 'a3f1c2 feat(vimeflow): live agent status panel' },
  { kind: 'out', text: '7e9b04 feat(lifeline): paired codex review loop' },
  { kind: 'out', text: '12d8af docs(wskills): bilingual skill catalog' },
  { kind: 'cmd', text: 'echo "say hi →" && open mailto:w.wang4869@gmail.com' },
];

function Terminal({ theme = 'cream', title = 'will@sydney: ~/work' }) {
  const [phase, setPhase] = React.useState({ line: 0, char: 0, mode: 'typing' });
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    const current = TERMINAL_LINES[phase.line % TERMINAL_LINES.length];
    if (!current) return;

    if (phase.mode === 'typing') {
      if (phase.char < current.text.length) {
        const speed = current.kind === 'cmd' ? 38 + Math.random() * 30 : 8 + Math.random() * 8;
        const t = setTimeout(() => setPhase((p) => ({ ...p, char: p.char + 1 })), speed);
        return () => clearTimeout(t);
      } else {
        const pause = current.kind === 'cmd' ? 380 : 90;
        const t = setTimeout(() => {
          setHistory((h) => [...h, current]);
          setPhase((p) => ({ line: p.line + 1, char: 0, mode: 'typing' }));
        }, pause);
        return () => clearTimeout(t);
      }
    }
  }, [phase]);

  // Reset loop when we run past the end (after final command, hold then restart)
  React.useEffect(() => {
    if (phase.line >= TERMINAL_LINES.length) {
      const t = setTimeout(() => {
        setHistory([]);
        setPhase({ line: 0, char: 0, mode: 'typing' });
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [phase.line]);

  const themes = {
    cream: {
      bg: '#fbf1c7',
      surface: '#f9f5d7',
      chrome: '#ebdbb2',
      border: '#d5c4a1',
      text: '#3c3836',
      muted: '#7c6f64',
      cmd: '#9d0006',     // gruvbox red
      prompt: '#79740e',  // gruvbox green
      accent: '#af3a03',  // gruvbox orange
      cursor: '#af3a03',
    },
    editorial: {
      bg: '#f9f5d7',
      surface: '#fbf1c7',
      chrome: '#ebdbb2',
      border: '#bdae93',
      text: '#282828',
      muted: '#665c54',
      cmd: '#076678',     // dark blue
      prompt: '#79740e',
      accent: '#b57614',  // dark yellow
      cursor: '#b57614',
    },
    dark: {
      bg: '#1d2021',
      surface: '#282828',
      chrome: '#3c3836',
      border: '#504945',
      text: '#ebdbb2',
      muted: '#a89984',
      cmd: '#fb4934',     // bright red
      prompt: '#b8bb26',  // bright green
      accent: '#fabd2f',  // bright yellow
      cursor: '#fe8019',  // bright orange
    },
  };
  const t = themes[theme];

  const current = TERMINAL_LINES[phase.line % TERMINAL_LINES.length];
  const visibleCurrent = current ? current.text.slice(0, phase.char) : '';

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
      boxShadow: theme === 'dark'
        ? '0 24px 60px rgba(0,0,0,0.45)'
        : '0 18px 50px rgba(60, 56, 54, 0.12)',
      width: '100%',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: t.chrome,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#cc241d' }}></span>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d79921' }}></span>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#98971a' }}></span>
        </div>
        <span style={{ color: t.muted, fontSize: 12, marginLeft: 8, letterSpacing: 0.2 }}>{title}</span>
      </div>

      {/* Body */}
      <div style={{
        padding: '18px 20px 22px',
        height: 360,
        maxHeight: 360,
        overflow: 'hidden',
        color: t.text,
        fontSize: 14,
        lineHeight: 1.7,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}>
        {history.slice(-12).map((line, i) => (
          <Line key={`h-${history.length - 12 + i}`} line={line} theme={t} />
        ))}
        {current && phase.line < TERMINAL_LINES.length && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {current.kind === 'cmd' && <span style={{ color: t.prompt, fontWeight: 700 }}>$</span>}
            <span style={{
              color: current.kind === 'cmd' ? t.cmd : t.text,
              fontWeight: current.kind === 'cmd' ? 600 : 400,
            }}>
              {visibleCurrent}
              <span style={{
                display: 'inline-block',
                width: 8, height: 16,
                background: t.cursor,
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                animation: 'blink 1s step-end infinite',
              }}></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Line({ line, theme }) {
  if (line.kind === 'cmd') {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ color: theme.prompt, fontWeight: 700 }}>$</span>
        <span style={{ color: theme.cmd, fontWeight: 600 }}>{line.text}</span>
      </div>
    );
  }
  return <div style={{ color: theme.text }}>{line.text}</div>;
}

window.Terminal = Terminal;
