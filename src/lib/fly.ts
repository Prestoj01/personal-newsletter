/**
 * "Send to press": launch a copy of a chosen topic chip on an arc into the live preview
 * (or the beat counter when the preview is off-screen), then make the target react.
 * Pure DOM + Web Animations so it never re-renders React. No-op for reduced motion.
 */
export function flyToPreview(from: HTMLElement) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const inView = (el: Element | null) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0 ? el : null;
  };
  const target = inView(document.querySelector("[data-fly-target]")) ?? inView(document.querySelector("[data-fly-fallback]"));
  if (!target) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const clone = from.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    margin: "0",
    zIndex: "60",
    pointerEvents: "none",
    background: "var(--color-ink)",
    color: "var(--color-paper)",
    boxShadow: "6px 6px 0 var(--color-accent)",
  });
  clone.setAttribute("aria-hidden", "true");
  document.body.appendChild(clone);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + Math.min(b.height / 2, 90) - (a.top + a.height / 2);
  const lift = -Math.min(160, 60 + Math.abs(dx) * 0.25);
  const spin = dx > 0 ? 18 : -18;

  clone
    .animate(
      [
        { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 + lift}px) rotate(${spin}deg) scale(1.15)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${spin * 2}deg) scale(0.35)`, opacity: 0 },
      ],
      { duration: 700, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
    )
    .finished.then(() => {
      clone.remove();
      target.animate(
        [
          { boxShadow: "0 0 0 0 var(--color-accent)" },
          { boxShadow: "0 0 0 6px color-mix(in srgb, var(--color-accent) 40%, transparent)" },
          { boxShadow: "0 0 0 0 transparent" },
        ],
        { duration: 450, easing: "ease-out" },
      );
    })
    .catch(() => clone.remove());
}
