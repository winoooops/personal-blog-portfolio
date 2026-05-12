// motion-layout-dock — the demo's wiring logic.
//
// What this teaches: the View Transitions API is the browser's native
// answer to FLIP-style "morph between layouts." It is what Motion
// (framer-motion)'s `layout` + `layoutId` do internally, except the
// browser does it without a JS animation runtime.
//
// Flow:
//   1. User clicks a position button.
//   2. We wrap the state change in document.startViewTransition.
//   3. The browser snapshots before + after, pairs elements by
//      view-transition-name (set in demo.css), and morphs between
//      the two layouts.
//
// Fallback: if startViewTransition is unsupported (older Firefox),
// the new state still applies — it just snaps without animation.

type Position = 'bottom' | 'top' | 'left' | 'right';

export default function initDockDemo(root: HTMLElement): void {
  const workspace = root.querySelector<HTMLElement>('.dock-demo__workspace');
  const buttons = root.querySelectorAll<HTMLButtonElement>('.dock-demo__btn');
  if (!workspace || !buttons.length) return;

  const setPosition = (next: Position) => {
    if (workspace.dataset.dock === next) return;

    const apply = () => {
      workspace.dataset.dock = next;
      buttons.forEach((btn) => {
        btn.setAttribute(
          'aria-pressed',
          btn.dataset.position === next ? 'true' : 'false',
        );
      });
    };

    // Feature-detect View Transitions API.
    // Available in Chrome/Edge 111+ (Mar 2023), Safari 18+ (Sep 2024),
    // Firefox 137+ (Apr 2025). Fall back to instant change otherwise.
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.position as Position | undefined;
      if (next) setPosition(next);
    });
  });
}
