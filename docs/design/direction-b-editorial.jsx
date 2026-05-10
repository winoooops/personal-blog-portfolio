// Direction B — Perry Wang × Dune
// Ultra-minimal portfolio with Dune accents: twin-sun horizon, layered dunes,
// drifting spice particles, and an animated terracotta→ochre→rust accent.

function DirectionBEditorial() {
  const C = {
    bg: '#f4efe6',         // warm cream
    bgSoft: '#ece6d9',
    ink: '#1a1a1a',
    inkSoft: '#2a2a2a',
    muted: '#7a7468',
    line: '#d8d0c0',
    accent: '#c14a1a',     // terracotta (animated)
    sand1: '#e8d9b8',
    sand2: '#d6bf8e',
    sand3: '#b89760',
    sun1: '#e8623d',
    sun2: '#f0a040',
  };

  // ─── Spice particle field — physical drift across the page ─────────────────
  const SpiceField = ({ count = 60, height = 800, seed = 1 }) => {
    const canvasRef = React.useRef(null);
    React.useEffect(() => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      // seeded RNG so particles are stable across re-renders
      let s = seed;
      const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      const W = rect.width, H = rect.height;
      const parts = Array.from({ length: count }, () => ({
        x: rand() * W,
        y: rand() * H,
        r: 0.6 + rand() * 1.6,
        vx: 0.15 + rand() * 0.35,        // gentle rightward drift
        vy: -0.05 - rand() * 0.12,       // slow rise
        wob: rand() * Math.PI * 2,
        wobSpd: 0.005 + rand() * 0.012,
        hue: rand() < 0.5 ? '#c14a1a' : (rand() < 0.5 ? '#e8623d' : '#b89760'),
        alpha: 0.25 + rand() * 0.45,
      }));
      let raf;
      const tick = () => {
        ctx.clearRect(0, 0, W, H);
        for (const p of parts) {
          p.wob += p.wobSpd;
          p.x += p.vx + Math.sin(p.wob) * 0.18;
          p.y += p.vy + Math.cos(p.wob * 0.7) * 0.08;
          if (p.x > W + 4) { p.x = -4; p.y = rand() * H; }
          if (p.y < -4) { p.y = H + 4; }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.hue;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(tick);
      };
      tick();
      return () => cancelAnimationFrame(raf);
    }, [count, height, seed]);
    return (
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.7,
      }} />
    );
  };

  // ─── Sand-worm removed ─────────────────────────────────────────────────────
  const _SandWormDisabled = () => {
    const [t, setT] = React.useState(0);
    React.useEffect(() => {
      let raf, start;
      const tick = (ts) => {
        if (!start) start = ts;
        setT(((ts - start) / 1000) % 14); // 14s loop
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);
    const segCount = 12;
    const phase = t / 14;
    // arc from left dune (x=180,y=380) up to peak (~y=210) and down to right dune (x=1100,y=380)
    const headProgress = phase;
    const segs = Array.from({ length: segCount }, (_, k) => {
      const u = Math.max(0, Math.min(1, headProgress - k * 0.05));
      const x = 180 + u * 920;
      const arc = -Math.sin(u * Math.PI) * 170;
      const wob = Math.sin((t * 1.8 + k * 0.55)) * 5;
      const y = 380 + arc + wob;
      // hide segments that haven't emerged yet
      const visible = u > 0 && u < 1;
      return { x, y, r: 9 - k * 0.45, visible, u };
    });
    const head = segs[0];
    const showSandPuff = phase < 0.06;
    const showDivePuff = phase > 0.94;
    return (
      <svg viewBox="0 0 1280 520" preserveAspectRatio="xMidYMax slice"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}>
        {/* shadow on dune tracking the head */}
        {head.visible && (
          <ellipse cx={head.x} cy="395" rx="42" ry="5"
                   fill={C.ink} opacity={0.18 * Math.max(0, Math.sin(phase * Math.PI))} />
        )}
        {/* body — tail to head so head renders on top */}
        {segs.slice().reverse().map((s, i) => s.visible && (
          <circle key={i} cx={s.x} cy={s.y} r={s.r}
                  fill={C.sun1} opacity={0.95 - (segCount - i) * 0.04}
                  stroke={C.accent} strokeWidth="0.5" />
        ))}
        {/* head highlight + eye */}
        {head.visible && (
          <g>
            <circle cx={head.x - 2} cy={head.y - 2} r="2" fill="#fff3d6" opacity="0.95" />
            <circle cx={head.x + 2.5} cy={head.y - 0.5} r="1.2" fill={C.ink} />
          </g>
        )}
        {/* sand puffs */}
        {showSandPuff && (
          <g opacity={1 - phase / 0.06}>
            <circle cx="180" cy="378" r={10 + phase * 120} fill={C.sand1} opacity="0.7" />
            <circle cx="168" cy="372" r={6 + phase * 80}  fill={C.sand2} opacity="0.55" />
          </g>
        )}
        {showDivePuff && (
          <g opacity={(phase - 0.94) / 0.06}>
            <circle cx="1100" cy="378" r={10 + (phase - 0.94) * 120} fill={C.sand1} opacity="0.7" />
            <circle cx="1112" cy="372" r={6 + (phase - 0.94) * 80}  fill={C.sand2} opacity="0.55" />
          </g>
        )}
      </svg>
    );
  };

  // ─── Twin-sun horizon SVG ──────────────────────────────────────────────────
  const TwinSunHorizon = () => (
    <svg viewBox="0 0 1280 520" preserveAspectRatio="xMidYMax slice"
         style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="sunA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3d6" stopOpacity="1" />
          <stop offset="40%" stopColor="#f0a040" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f0a040" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunB" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe0b8" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#e8623d" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#e8623d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4efe6" stopOpacity="0" />
          <stop offset="100%" stopColor="#e8c89a" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* atmospheric haze */}
      <rect x="0" y="200" width="1280" height="320" fill="url(#haze)" />
      {/* twin suns — one large, one smaller, slow pulse */}
      <g style={{ animation: 'duneSunPulse 9s ease-in-out infinite' }}>
        <circle cx="880" cy="300" r="170" fill="url(#sunA)" />
        <circle cx="880" cy="300" r="56" fill="#f5b86a" opacity="0.85" />
      </g>
      <g style={{ animation: 'duneSunPulse 11s ease-in-out infinite reverse' }}>
        <circle cx="1020" cy="240" r="100" fill="url(#sunB)" />
        <circle cx="1020" cy="240" r="28" fill="#e8623d" opacity="0.9" />
      </g>
      {/* tiny silhouetted birds */}
      <g fill={C.ink} opacity="0.55" style={{ animation: 'duneBirdDrift 18s linear infinite' }}>
        <path d="M 240 180 q 6 -6 12 0 q 6 -6 12 0" stroke={C.ink} strokeWidth="1.2" fill="none" />
        <path d="M 320 210 q 5 -5 10 0 q 5 -5 10 0" stroke={C.ink} strokeWidth="1.1" fill="none" />
        <path d="M 180 250 q 4 -4 8 0 q 4 -4 8 0" stroke={C.ink} strokeWidth="1" fill="none" />
      </g>
      {/* layered dunes */}
      <path d="M 0 380 Q 200 340 420 360 T 820 360 T 1280 350 L 1280 520 L 0 520 Z" fill={C.sand1} />
      <path d="M 0 420 Q 180 390 380 410 T 760 405 T 1280 400 L 1280 520 L 0 520 Z" fill={C.sand2} />
      <path d="M 0 470 Q 220 450 460 460 T 880 455 T 1280 460 L 1280 520 L 0 520 Z" fill={C.sand3} />
      {/* rim-light highlight on top dune */}
      <path d="M 0 380 Q 200 340 420 360 T 820 360 T 1280 350"
            stroke="#fff5e0" strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
  const sans = '"Inter", -apple-system, system-ui, sans-serif';
  const display = '"Inter", -apple-system, system-ui, sans-serif';

  const works = [
    { title: 'Vimeflow', co: 'Personal', yr: '26', line: 'A control plane for coding agents — terminals, diffs, live status.', tags: ['TypeScript', 'React', 'Tauri'], dot: C.accent,  status: 'Shipping' },
    { title: 'Lifeline', co: 'Personal', yr: '25', line: 'Autonomous harness for Claude Code — paired Codex review, PR opener.', tags: ['Python', 'Claude API', 'GitHub Actions'], dot: C.sun1, status: 'Active' },
    { title: 'wskills',  co: 'Personal', yr: '25', line: 'A bilingual library of agent skills, distilled into repeatable workflows.', tags: ['Markdown', 'EN / 中文', 'OSS'], dot: C.sun2, status: 'Maintained' },
    { title: 'llm-tui',  co: 'Personal', yr: '25', line: 'A Rust terminal chat for local OpenAI-compatible LLM servers.', tags: ['Rust', 'Ratatui', 'CLI'], dot: C.sand3, status: 'Stable' },
    { title: 'nvim',     co: 'Personal', yr: '24', line: 'A cross-platform Neovim and tmux environment for reviewing agents.', tags: ['Lua', 'Neovim', 'tmux'], dot: C.muted, status: 'Daily driver' },
  ];

  const Row = ({ children, top = false, bottom = false }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0',
      borderTop: top ? `1px solid ${C.line}` : 'none',
      borderBottom: bottom ? `1px solid ${C.line}` : 'none',
    }}>{children}</div>
  );

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: C.bg, color: C.ink,
      fontFamily: sans,
      position: 'relative',
    }}>
      <style>{`
        @keyframes duneMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes duneAccentShift {
          0%   { color: #c14a1a; }
          33%  { color: #e8623d; }
          66%  { color: #b89760; }
          100% { color: #c14a1a; }
        }
        @keyframes duneShimmer {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes duneSunPulse {
          0%, 100% { opacity: 0.92; transform: translateY(0); }
          50%      { opacity: 1;    transform: translateY(-3px); }
        }
        @keyframes duneBirdDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(280px); }
        }
        .dune-accent {
          animation: duneAccentShift 8s ease-in-out infinite;
          font-weight: 500;
        }
        .dune-shimmer {
          background: linear-gradient(90deg, #c14a1a, #e8623d, #f0a040, #b89760, #c14a1a);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: duneShimmer 7s ease-in-out infinite;
        }
      `}</style>
      {/* HEADER — Perry-style triplet */}
      <header style={{ padding: '36px 48px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Left: monogram + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              width: 42, height: 42, borderRadius: '50%',
              background: C.ink, color: C.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: display, fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em',
            }}>W</span>
            <div>
              <div style={{ fontFamily: display, fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Will Wang</div>
              <div style={{ fontFamily: sans, fontSize: 13, color: C.muted, letterSpacing: '0.01em' }}>Software Engineer</div>
            </div>
          </div>
          {/* Center: MAIN nav */}
          <div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>Main</div>
            <div style={{ display: 'flex', gap: 18, fontFamily: display, fontWeight: 500, fontSize: 16 }}>
              <a href="#" style={{ color: C.ink, textDecoration: 'none', borderBottom: `1.5px solid ${C.ink}`, paddingBottom: 1 }}>Work</a>
              <a href="#" style={{ color: C.muted, textDecoration: 'none' }}>Blog</a>
              <a href="#" style={{ color: C.muted, textDecoration: 'none' }}>Info</a>
            </div>
          </div>
          {/* Right: CONTACT */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>Contact</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, fontFamily: display, fontWeight: 500, fontSize: 16 }}>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>GitHub</a>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>LinkedIn</a>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>Email</a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO — statement + twin-sun horizon + spice particles */}
      <section style={{
        padding: '180px 48px 140px',
        position: 'relative',
        minHeight: 760,
        overflow: 'hidden',
      }}>
        {/* atmosphere layers */}
        <TwinSunHorizon />
        <SpiceField count={70} seed={7} />

        <div style={{ maxWidth: 1100, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: display,
            fontSize: 'clamp(48px, 6.5vw, 96px)',
            lineHeight: 1.05, letterSpacing: '-0.04em',
            fontWeight: 500,
            margin: 0, color: C.ink,
            maxWidth: 1000,
          }}>
            I build tools, harnesses & systems for{' '}
            <span className="dune-shimmer">coding agents</span>.
          </h1>
          <p style={{
            fontFamily: sans, fontSize: 22, lineHeight: 1.45,
            color: C.inkSoft, marginTop: 36, maxWidth: 720,
            fontWeight: 400,
          }}>
            Software engineer at <span className="dune-accent">Vimeflow</span>. Based in Sydney.<br/>
            Working in TypeScript, Rust, Python — agentic AI, full-stack, dev tooling.
          </p>
        </div>

        {/* big scroll-cue arrow */}
        <div style={{
          position: 'absolute', bottom: 56, left: 48,
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: sans, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: C.muted,
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4 V22 M14 22 L6 14 M14 22 L22 14" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Scroll · See work</span>
        </div>
      </section>

      {/* CURRENTLY — quiet meta strip beneath hero */}
      <section style={{
        padding: '32px 48px',
        borderTop: `1px solid ${C.line}`,
        borderBottom: `1px solid ${C.line}`,
        background: C.bgSoft,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { k: 'Location', v: 'Sydney, AU', sub: 'GMT+11 · open to remote' },
            { k: 'Now',      v: 'Vimeflow', sub: 'Software Engineer · 2025–' },
            { k: 'Building', v: 'Lifeline + wskills', sub: 'Autonomous coding research' },
            { k: 'Status',   v: 'Open to side gigs', sub: 'Dev tools, agentic systems' },
          ].map((c, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              borderLeft: i === 0 ? 'none' : `1px solid ${C.line}`,
              paddingLeft: i === 0 ? 0 : 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === 1 ? C.accent : C.muted,
                  animation: i === 1 ? 'duneSunPulse 1.6s ease-in-out infinite' : 'none',
                }}></span>
                <span style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{c.k}</span>
              </div>
              <div style={{ fontFamily: display, fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em', color: C.ink }}>{c.v}</div>
              <div style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SELECTED WORK — list */}
      <section style={{ padding: '48px 48px 80px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 28,
        }}>
          <h2 style={{
            fontFamily: display, fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em',
            margin: 0, color: C.ink,
          }}>
            Selected Work <span style={{ color: C.muted }}>'26</span>
          </h2>
          <a href="#" style={{ fontFamily: sans, fontSize: 13, color: C.muted, textDecoration: 'none' }}>All projects →</a>
        </div>

        <div style={{ borderTop: `1px solid ${C.line}` }}>
          {works.map((w, i) => (
            <a key={i} href="#" style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              alignItems: 'baseline', gap: 32,
              padding: '36px 4px',
              borderBottom: `1px solid ${C.line}`,
              textDecoration: 'none', color: C.ink,
              transition: 'padding 0.2s ease, color 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '24px'; e.currentTarget.querySelector('.title').style.color = C.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = '4px'; e.currentTarget.querySelector('.title').style.color = C.ink; }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: w.dot, flexShrink: 0,
                    boxShadow: `0 0 0 4px ${w.dot}22`,
                  }}></span>
                  <span style={{
                    fontFamily: sans, fontSize: 11, color: C.muted,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                  }}>{w.co} · '{w.yr} · {w.status}</span>
                </div>
                <h3 className="title" style={{
                  fontFamily: display, fontSize: 'clamp(40px, 4.6vw, 64px)',
                  fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05,
                  margin: 0, color: C.ink, transition: 'color 0.2s',
                }}>{w.title}</h3>
                <div style={{
                  marginTop: 14,
                  fontFamily: sans, fontSize: 17, color: C.inkSoft, lineHeight: 1.5,
                  maxWidth: 720,
                }}>{w.line}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18 }}>
                  {w.tags.map((t, k) => (
                    <span key={k} style={{
                      fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
                      fontSize: 11, color: C.inkSoft,
                      padding: '4px 10px',
                      border: `1px solid ${C.line}`, borderRadius: 999,
                      letterSpacing: '0.02em',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ flexShrink: 0, alignSelf: 'center' }}>
                <circle cx="22" cy="22" r="21" stroke={C.line} fill="transparent" />
                <path d="M16 22 H28 M22 16 L28 22 L22 28" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </section>

      {/* STACK & TOOLS — quiet meta strip */}
      <section style={{ padding: '64px 48px', borderTop: `1px solid ${C.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 64 }}>
          <div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Stack</div>
            <h2 style={{
              fontFamily: display, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em',
              lineHeight: 1.15, margin: '14px 0 0', color: C.ink,
            }}>Tools I reach for, by gravity.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {[
              { cat: 'Languages', items: ['TypeScript', 'Rust', 'Python', 'Lua', 'Go'] },
              { cat: 'Agents',    items: ['Claude Code', 'Codex', 'Cursor', 'Aider'] },
              { cat: 'Runtime',   items: ['Node', 'Bun', 'Tauri', 'Cloudflare Workers'] },
              { cat: 'Surface',   items: ['Neovim', 'tmux', 'Astro', 'Obsidian'] },
            ].map((g, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', paddingBottom: 8, borderBottom: `1px solid ${C.line}` }}>{g.cat}</div>
                {g.items.map((it, k) => (
                  <div key={k} style={{ fontFamily: sans, fontSize: 15, color: C.inkSoft, lineHeight: 1.5 }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKING MODEL — quiet, paired with hairlines */}
      <section style={{ padding: '80px 48px', borderTop: `1px solid ${C.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 64 }}>
          <div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Process</div>
            <h2 style={{
              fontFamily: display, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em',
              lineHeight: 1.15, margin: '14px 0 0', color: C.ink,
            }}>Notes become articles, without changing tools.</h2>
          </div>
          <div>
            {[
              { n: '01', h: 'Note', body: 'Write privately in Obsidian. Mark notes destined for the public vault.' },
              { n: '02', h: 'Sync', body: 'A small script copies designated notes into the Astro blog collection.' },
              { n: '03', h: 'Publish', body: 'Commit to GitHub. Pages workflow rebuilds. The site is current again.' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '60px 140px 1fr', gap: 24,
                padding: '24px 0',
                borderBottom: `1px solid ${C.line}`,
                borderTop: i === 0 ? `1px solid ${C.line}` : 'none',
                alignItems: 'baseline',
              }}>
                <div style={{ fontFamily: sans, fontSize: 13, color: C.muted, letterSpacing: '0.04em' }}>{s.n}</div>
                <h3 style={{ fontFamily: display, fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', margin: 0, color: C.ink }}>{s.h}</h3>
                <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.55, color: C.inkSoft, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVITY TIMELINE — live stream, cream-styled */}
      <section style={{ padding: '80px 48px', borderTop: `1px solid ${C.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 64 }}>
          <div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Activity</div>
            <h2 style={{
              fontFamily: display, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em',
              lineHeight: 1.15, margin: '14px 0 16px', color: C.ink,
            }}>What I'm shipping right now.</h2>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: sans, fontSize: 12, color: C.accent,
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(193,74,26,0.08)',
              border: `1px solid rgba(193,74,26,0.2)`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: C.accent,
                animation: 'duneSunPulse 1.4s ease-in-out infinite',
              }}></span>
              <span style={{ letterSpacing: '0.06em' }}>STREAMING</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            {/* timeline rail */}
            <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, background: C.line }}></div>
            {[
              { time: 'now',  glyph: '⏵', tone: C.accent,  msg: 'lifeline · spec planner running',     k: 'agent' },
              { time: '12s',  glyph: '+', tone: C.accent,  msg: 'commit · feat(vimeflow): live agent panel', k: 'commit' },
              { time: '4m',   glyph: '✓', tone: C.sun2,    msg: 'tests · 184 passed',                  k: 'test' },
              { time: '11m',  glyph: '↑', tone: C.sun2,    msg: 'deploy · pages.dev built in 47s',     k: 'deploy' },
              { time: '32m',  glyph: '◆', tone: C.sand3,   msg: 'note · synced 3 entries from obsidian', k: 'note' },
              { time: '1h',   glyph: '⊕', tone: C.sun1,    msg: 'pr · #18 opened on lifeline',          k: 'pr' },
              { time: '3h',   glyph: '✎', tone: C.muted,   msg: 'draft · "RAG without the rag" wip',    k: 'draft' },
            ].map((a, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '24px 80px 1fr',
                alignItems: 'center', gap: 18,
                padding: '14px 0',
                position: 'relative',
                opacity: 1 - i * 0.08,
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: a.tone, color: i === 0 ? '#fff' : C.bg,
                  fontFamily: sans, fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1,
                  boxShadow: i === 0 ? `0 0 0 4px rgba(193,74,26,0.15)` : 'none',
                }}>{a.glyph}</span>
                <span style={{ fontFamily: sans, fontSize: 13, color: C.muted, letterSpacing: '0.04em' }}>{a.time}</span>
                <span style={{
                  fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
                  fontSize: 14, color: i === 0 ? C.ink : C.inkSoft,
                  fontWeight: i === 0 ? 600 : 400,
                }}>{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNAL — personal blog area */}
      <section style={{ padding: '80px 48px', borderTop: `1px solid ${C.line}` }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 36,
        }}>
          <div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Journal</div>
            <h2 style={{
              fontFamily: display, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em',
              margin: 0, color: C.ink,
            }}>Field notes from the desert.</h2>
          </div>
          <a href="#" style={{ fontFamily: sans, fontSize: 13, color: C.muted, textDecoration: 'none' }}>All posts →</a>
        </div>

        {/* Featured post — large card */}
        <a href="#" style={{
          display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48,
          padding: '36px 0',
          borderTop: `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          textDecoration: 'none', color: C.ink,
          marginBottom: 32,
        }}>
          <div style={{
            aspectRatio: '4/3',
            background: `linear-gradient(135deg, ${C.sand1} 0%, ${C.sun2} 50%, ${C.accent} 100%)`,
            borderRadius: 4,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 70% 30%, rgba(255,243,214,0.6), transparent 50%)',
            }} />
            <div style={{
              position: 'absolute', bottom: 16, left: 18,
              fontFamily: sans, fontSize: 11, color: '#fff', letterSpacing: '0.18em', textTransform: 'uppercase',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}>Featured</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
              Essay · Mar 2026 · 8 min
            </div>
            <h3 style={{
              fontFamily: display, fontSize: 'clamp(32px, 3.4vw, 44px)',
              fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1,
              margin: '0 0 16px', color: C.ink,
            }}>Why I let coding agents drive — and where I keep my hands on the wheel.</h3>
            <p style={{ fontFamily: sans, fontSize: 17, lineHeight: 1.6, color: C.inkSoft, margin: 0, maxWidth: 540 }}>
              A year of pairing with Claude and Codex on real shipping work. The patterns that survived, the ones that didn't, and the small rituals that make autonomous coding actually feel safe.
            </p>
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, fontFamily: sans, fontSize: 14, color: C.accent, fontWeight: 500 }}>
              <span>Read essay</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8 H13 M9 4 L13 8 L9 12" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </a>

        {/* Recent posts — compact list */}
        <div>
          {[
            { tag: 'Notes',   date: 'Feb 2026', mins: '4 min', title: 'Tmux as a control plane: my agent review setup.' },
            { tag: 'Build',   date: 'Jan 2026', mins: '6 min', title: 'Vimeflow, three months in — what changed and what didn\'t.' },
            { tag: 'Tools',   date: 'Dec 2025', mins: '5 min', title: 'A small Rust TUI that talks to any OpenAI-compatible server.' },
            { tag: 'Process', date: 'Nov 2025', mins: '3 min', title: 'Obsidian → Astro → GitHub Pages, with no extra cognitive load.' },
          ].map((p, i) => (
            <a key={i} href="#" style={{
              display: 'grid', gridTemplateColumns: '120px 100px 1fr 80px',
              alignItems: 'baseline', gap: 24,
              padding: '20px 4px',
              borderBottom: `1px solid ${C.line}`,
              textDecoration: 'none', color: C.ink,
              transition: 'padding 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = '20px'; e.currentTarget.querySelector('.post-title').style.color = C.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = '4px'; e.currentTarget.querySelector('.post-title').style.color = C.ink; }}
            >
              <span style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{p.tag}</span>
              <span style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>{p.date}</span>
              <h4 className="post-title" style={{
                fontFamily: display, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em',
                margin: 0, color: C.ink, lineHeight: 1.3, transition: 'color 0.2s',
              }}>{p.title}</h4>
              <span style={{ fontFamily: sans, fontSize: 13, color: C.muted, textAlign: 'right' }}>{p.mins}</span>
            </a>
          ))}
        </div>
      </section>

      {/* COLOPHON — quiet about/credits */}
      <section style={{ padding: '80px 48px', borderTop: `1px solid ${C.line}`, background: C.bgSoft }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 64 }}>
          <div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Colophon</div>
            <h2 style={{
              fontFamily: display, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em',
              lineHeight: 1.15, margin: '14px 0 0', color: C.ink,
            }}>About this site.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 720 }}>
            <p style={{ fontFamily: sans, fontSize: 17, lineHeight: 1.65, color: C.inkSoft, margin: 0 }}>
              This corner of the internet runs on Astro, lives on GitHub Pages, and is written mostly in Obsidian. The palette is warmed cream and terracotta, with two suns on the horizon — a small homage to the desert that loaned me its colors.
            </p>
            <p style={{ fontFamily: sans, fontSize: 17, lineHeight: 1.65, color: C.inkSoft, margin: 0 }}>
              Type is set in Inter for body and headlines, JetBrains Mono for anything that should feel like it belongs in a terminal. No analytics, no popups, no newsletter. If something here is useful or wrong, <a href="#" style={{ color: C.accent, textDecoration: 'underline', textUnderlineOffset: 3 }}>send me a note</a>.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 12, fontFamily: sans, fontSize: 13, color: C.muted }}>
              <span>Astro 5</span>
              <span>·</span>
              <span>Inter + JetBrains Mono</span>
              <span>·</span>
              <span>Hosted on Pages</span>
              <span>·</span>
              <span>Source on GitHub</span>
            </div>
          </div>
        </div>
      </section>

      {/* INFO strip — recognizable Perry "made with love" footer */}
      <footer style={{ padding: '64px 48px 48px', borderTop: `1px solid ${C.line}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, alignItems: 'end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              width: 42, height: 42, borderRadius: '50%',
              background: C.ink, color: C.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: display, fontWeight: 600, fontSize: 18,
            }}>W</span>
            <div>
              <div style={{ fontFamily: display, fontWeight: 500, fontSize: 16, color: C.ink }}>Will Wang</div>
              <div style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>Software Engineer</div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Main</div>
            <div style={{ display: 'flex', gap: 18, fontFamily: display, fontWeight: 500, fontSize: 16 }}>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>Work</a>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>Blog</a>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>Info</a>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Contact</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, fontFamily: display, fontWeight: 500, fontSize: 16 }}>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>LinkedIn</a>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>GitHub</a>
              <a href="#" style={{ color: C.ink, textDecoration: 'none' }}>Email</a>
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 56, paddingTop: 20,
          borderTop: `1px solid ${C.line}`,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: sans, fontSize: 13, color: C.muted,
        }}>
          <span>© 2026 Will Wang. All Rights Reserved.</span>
          <span>Made with coffee and long walks at Bondi (extra hot, no foam).</span>
        </div>
      </footer>
    </div>
  );
}

window.DirectionBEditorial = DirectionBEditorial;
