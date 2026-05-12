// motion-layout-dock — the simplest possible Motion layout demo:
// one terminal pane and one dock pane, with the dock movable to one
// of four positions. The dock carries layoutId so Motion treats it
// as the same visual object across render positions and animates
// between them rather than snapping.

import { useState } from 'react';
import { LayoutGroup, motion } from 'motion/react';

type DockPosition = 'bottom' | 'top' | 'left' | 'right';

const POSITIONS: readonly DockPosition[] = ['bottom', 'top', 'left', 'right'];

const SPRING = { type: 'spring' as const, stiffness: 360, damping: 34 };

export default function DockDemo() {
  const [position, setPosition] = useState<DockPosition>('bottom');
  const isHorizontal = position === 'left' || position === 'right';
  const isReverse = position === 'left' || position === 'top';

  return (
    <LayoutGroup>
      <div className="dock-demo">
        <div className="dock-demo__controls" role="group" aria-label="Dock position">
          {POSITIONS.map((p) => (
            <button
              key={p}
              type="button"
              className="dock-demo__btn"
              aria-pressed={position === p ? 'true' : 'false'}
              onClick={() => setPosition(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="dock-demo__workspace"
          data-dock={position}
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
          }}
          transition={SPRING}
        >
          {isReverse && <Dock isHorizontal={isHorizontal} />}
          <Terminal />
          {!isReverse && <Dock isHorizontal={isHorizontal} />}
        </motion.div>

        <p className="dock-demo__caption">
          <code>motion.div layout</code> measures the before/after boxes;{' '}
          <code>layoutId</code> keeps the dock the same visual object across positions.
        </p>
      </div>
    </LayoutGroup>
  );
}

function Terminal() {
  return (
    <motion.div
      layout
      layoutId="dock-demo-terminal"
      className="dock-demo__pane dock-demo__pane--terminal"
      transition={SPRING}
    >
      <div className="dock-demo__pane-head">
        <span className="dock-demo__pane-dot dock-demo__pane-dot--active" aria-hidden="true" />
        <span className="dock-demo__pane-label">Terminal</span>
      </div>
      <div className="dock-demo__pane-body">
        <div className="dock-demo__bar" style={{ width: '72%' }} />
        <div className="dock-demo__bar" style={{ width: '54%' }} />
        <div className="dock-demo__bar" style={{ width: '86%' }} />
        <div className="dock-demo__bar" style={{ width: '42%' }} />
      </div>
    </motion.div>
  );
}

function Dock({ isHorizontal }: { isHorizontal: boolean }) {
  return (
    <motion.div
      layout
      layoutId="dock-demo-dock"
      className="dock-demo__pane dock-demo__pane--dock"
      style={{
        width: isHorizontal ? 160 : 'auto',
        height: isHorizontal ? 'auto' : 96,
      }}
      transition={SPRING}
    >
      <div className="dock-demo__pane-head">
        <span className="dock-demo__pane-dot dock-demo__pane-dot--accent" aria-hidden="true" />
        <span className="dock-demo__pane-label">Editor</span>
      </div>
      <div className="dock-demo__pane-body">
        <div className="dock-demo__bar" style={{ width: '64%' }} />
        <div className="dock-demo__bar" style={{ width: '78%' }} />
        <div className="dock-demo__bar" style={{ width: '48%' }} />
      </div>
    </motion.div>
  );
}
