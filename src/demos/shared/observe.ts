// Lazy initializer for inline demos.
// Each demo root has data-demo-init="<name>". When the root scrolls
// into view, the matching module's default export runs once with the
// root element. Bundle is split per demo via dynamic import.
//
// To register a new demo, add an entry to the `demos` map below.

type DemoInit = (root: HTMLElement) => void | Promise<void>;

const demos: Record<string, () => Promise<{ default: DemoInit }>> = {
  // Add vanilla demo entries here as `<name>: () => import('../<name>/demo.ts')`.
  // React/Motion demos (e.g. motion-layout-dock, vimeflow-workspace) mount via
  // Astro's client:visible directive instead and don't appear in this registry.
};

const seen = new WeakSet<Element>();

function init() {
  const roots = document.querySelectorAll<HTMLElement>('[data-demo-init]');
  if (!roots.length) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      if (seen.has(el)) continue;
      seen.add(el);
      observer.unobserve(el);

      const name = el.dataset.demoInit;
      if (!name) continue;

      const load = demos[name];
      if (!load) {
        console.warn(`[demos/observe] no entry registered for demo "${name}"`);
        continue;
      }

      load()
        .then((mod) => mod.default(el))
        .catch((err) => {
          console.error(`[demos/observe] failed to init demo "${name}":`, err);
        });
    }
  }, {
    rootMargin: '128px 0px',
    threshold: 0.01,
  });

  roots.forEach((el) => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
