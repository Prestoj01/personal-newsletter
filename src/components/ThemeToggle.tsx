"use client";

import { useEffect, useSyncExternalStore } from "react";
import { THEME_KEY, type Theme } from "@/lib/theme";

const current = (): Theme => (document.documentElement.dataset.theme === "night" ? "night" : "day");

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

/** Day / night edition switch. The new edition wipes across in a circle from the button. */
export function ThemeToggle({ compact = false, tabIndex }: { compact?: boolean; tabIndex?: number }) {
  const theme = useSyncExternalStore(subscribe, current, () => "day" as Theme);
  const next: Theme = theme === "night" ? "day" : "night";

  // Follow the system setting until the reader picks an edition themselves.
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!localStorage.getItem(THEME_KEY)) apply(media.matches ? "night" : "day");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    localStorage.setItem(THEME_KEY, next);
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !document.startViewTransition) return apply(next);

    const r = e.currentTarget.getBoundingClientRect();
    root.style.setProperty("--reveal-x", `${r.left + r.width / 2}px`);
    root.style.setProperty("--reveal-y", `${r.top + r.height / 2}px`);
    root.classList.add("theme-switching");
    const transition = document.startViewTransition(() => apply(next));
    transition.finished.finally(() => root.classList.remove("theme-switching"));
  }

  const label = theme === "night" ? "Switch to the day edition" : "Switch to the night edition";
  return (
    <button type="button" onClick={toggle} tabIndex={tabIndex} aria-label={label} title={label} className="inline-flex items-center gap-1.5 hover:text-accent">
      <span aria-hidden className="text-sm leading-none">
        {theme === "night" ? "☀" : "☾"}
      </span>
      {!compact && <span className="hidden sm:inline">{theme === "night" ? "Day" : "Night"}</span>}
    </button>
  );
}
