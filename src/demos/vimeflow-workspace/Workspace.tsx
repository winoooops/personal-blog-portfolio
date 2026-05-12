// Vimeflow workspace skeleton — adapted from the original Next.js
// project (github.com/winoooops/vimeflow), trimmed down to the layout
// animation surface that this blog post is teaching.
//
// Uses motion's <motion.div layout> + LayoutGroup + AnimatePresence
// — the exact API the post walks through. The component is wrapped
// in an Astro <... client:visible> island so this whole React bundle
// (motion + react-dom) only loads when the demo scrolls into view.

import { useState } from 'react';
import { LayoutGroup, AnimatePresence, motion } from 'motion/react';

type LayoutId = 'single' | 'vsplit' | 'hsplit' | 'threeRight' | 'quad';
type DockPosition = 'hidden' | 'bottom' | 'top' | 'left' | 'right';

interface LayoutShape {
  id: LayoutId;
  label: string;
  columns: string;
  rows: string;
  areas: string;
  panes: readonly string[];
}

const LAYOUTS: Record<LayoutId, LayoutShape> = {
  single: { id: 'single', label: 'Single', columns: '1fr', rows: '1fr', areas: '"p0"', panes: ['Claude'] },
  vsplit: { id: 'vsplit', label: 'Vert', columns: '1fr 1fr', rows: '1fr', areas: '"p0 p1"', panes: ['Claude', 'Codex'] },
  hsplit: { id: 'hsplit', label: 'Horiz', columns: '1fr', rows: '1fr 1fr', areas: '"p0" "p1"', panes: ['Claude', 'Codex'] },
  threeRight: {
    id: 'threeRight',
    label: 'Main + stack',
    columns: '1.35fr 1fr',
    rows: '1fr 1fr',
    areas: '"p0 p1" "p0 p2"',
    panes: ['Claude', 'Codex', 'Hunk'],
  },
  quad: {
    id: 'quad',
    label: 'Quad',
    columns: '1fr 1fr',
    rows: '1fr 1fr',
    areas: '"p0 p1" "p2 p3"',
    panes: ['Claude', 'Codex', 'Hunk', 'Shell'],
  },
};

const DOCK_POSITIONS: readonly DockPosition[] = ['hidden', 'bottom', 'top', 'left', 'right'];

const PANE_BARS: Record<string, readonly number[]> = {
  Claude: [72, 54, 86, 42],
  Codex: [64, 78, 48],
  Hunk: [58, 72],
  Shell: [80, 52, 64],
};

const SPRING = { type: 'spring' as const, stiffness: 360, damping: 34 };

export default function VimeflowWorkspace() {
  const [layoutId, setLayoutId] = useState<LayoutId>('threeRight');
  const [dockPosition, setDockPosition] = useState<DockPosition>('bottom');

  return (
    <LayoutGroup>
      <div className="vw-demo">
        <Controls
          layoutId={layoutId}
          dockPosition={dockPosition}
          onLayoutChange={setLayoutId}
          onDockChange={setDockPosition}
        />

        <DockedWorkspace layoutId={layoutId} dockPosition={dockPosition} />

        <p className="vw-demo__caption">
          Each <code>motion.div</code> carries <code>layout</code>; the dock and panes carry
          <code> layoutId</code>. Motion pairs old + new positions and animates the box delta — the
          mechanism behind everything in the post above.
        </p>
      </div>
    </LayoutGroup>
  );
}

function DockedWorkspace({
  layoutId,
  dockPosition,
}: {
  layoutId: LayoutId;
  dockPosition: DockPosition;
}) {
  const layout = LAYOUTS[layoutId];
  const hasDock = dockPosition !== 'hidden';
  const isHorizontalDock = dockPosition === 'left' || dockPosition === 'right';
  const isReverse = dockPosition === 'left' || dockPosition === 'top';

  return (
    <motion.div
      layout
      className="vw-demo__workspace"
      data-dock={dockPosition}
      style={{
        display: 'flex',
        flexDirection: isHorizontalDock ? 'row' : 'column',
      }}
      transition={SPRING}
    >
      {hasDock && isReverse && <DockPane dockPosition={dockPosition} />}
      <TerminalGrid layout={layout} />
      {hasDock && !isReverse && <DockPane dockPosition={dockPosition} />}
    </motion.div>
  );
}

function TerminalGrid({ layout }: { layout: LayoutShape }) {
  return (
    <motion.div
      layout
      className="vw-demo__grid"
      style={{
        gridTemplateColumns: layout.columns,
        gridTemplateRows: layout.rows,
        gridTemplateAreas: layout.areas,
      }}
      transition={SPRING}
    >
      <AnimatePresence initial={false}>
        {layout.panes.map((pane, index) => (
          <motion.div
            key={pane}
            layout
            layoutId={`vw-pane-${pane}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={SPRING}
            className="vw-demo__pane vw-demo__pane--terminal"
            style={{ gridArea: `p${index}` }}
          >
            <PaneContent label={pane} active={index === 0} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function DockPane({ dockPosition }: { dockPosition: DockPosition }) {
  const isSide = dockPosition === 'left' || dockPosition === 'right';
  return (
    <motion.div
      layout
      layoutId="vw-dock"
      className="vw-demo__pane vw-demo__pane--dock"
      animate={{
        width: isSide ? 180 : '100%',
        height: isSide ? '100%' : 110,
      }}
      transition={SPRING}
    >
      <div className="vw-demo__pane-head">
        <span className="vw-demo__pane-dot vw-demo__pane-dot--accent" aria-hidden="true" />
        <span className="vw-demo__pane-label">Editor</span>
      </div>
      <div className="vw-demo__pane-body">
        <div className="vw-demo__bar" style={{ width: '64%' }} />
        <div className="vw-demo__bar" style={{ width: '78%' }} />
        <div className="vw-demo__bar" style={{ width: '48%' }} />
      </div>
    </motion.div>
  );
}

function PaneContent({ label, active }: { label: string; active: boolean }) {
  const widths = PANE_BARS[label] ?? [60, 70];
  return (
    <>
      <div className="vw-demo__pane-head">
        <span
          className={`vw-demo__pane-dot${active ? ' vw-demo__pane-dot--active' : ''}`}
          aria-hidden="true"
        />
        <span className="vw-demo__pane-label">{label}</span>
      </div>
      <div className="vw-demo__pane-body">
        {widths.map((w, i) => (
          <div key={i} className="vw-demo__bar" style={{ width: `${w}%` }} />
        ))}
      </div>
    </>
  );
}

function Controls({
  layoutId,
  dockPosition,
  onLayoutChange,
  onDockChange,
}: {
  layoutId: LayoutId;
  dockPosition: DockPosition;
  onLayoutChange: (id: LayoutId) => void;
  onDockChange: (pos: DockPosition) => void;
}) {
  return (
    <div className="vw-demo__controls">
      <div className="vw-demo__group" role="group" aria-label="Pane layout">
        <span className="vw-demo__group-label">Pane layout</span>
        <div className="vw-demo__btn-row">
          {Object.values(LAYOUTS).map((l) => (
            <button
              key={l.id}
              type="button"
              className="vw-demo__btn"
              aria-pressed={layoutId === l.id ? 'true' : 'false'}
              onClick={() => onLayoutChange(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="vw-demo__group" role="group" aria-label="Dock position">
        <span className="vw-demo__group-label">Dock</span>
        <div className="vw-demo__btn-row">
          {DOCK_POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              className="vw-demo__btn vw-demo__btn--alt"
              aria-pressed={dockPosition === pos ? 'true' : 'false'}
              onClick={() => onDockChange(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
