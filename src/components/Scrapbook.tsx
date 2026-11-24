"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { removeClipping, type Clipping } from "@/lib/clippings";
import { emojiFor } from "@/lib/topics";
import { useClippings } from "./useClippings";
import { buttonClass, chipClass } from "./ui";

/** Small deterministic hash so each cut-out keeps the same crooked angle between visits. */
function tilt(url: string, range: number) {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 1000) / 1000 - 0.5) * 2 * range;
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Every clipped story, pinned up as a newsprint cut-out. */
export function Scrapbook() {
  const clippings = useClippings();
  const [filter, setFilter] = useState<string | null>(null);

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of clippings) counts.set(c.topic, (counts.get(c.topic) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [clippings]);
  const active = filter && topics.some(([t]) => t === filter) ? filter : null;
  const shown = active ? clippings.filter((c) => c.topic === active) : clippings;

  function unclip(c: Clipping, card: HTMLElement | null) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!card || reduce) return removeClipping(c.url);
    // Crumple it up and toss it.
    card
      .animate(
        [
          { transform: card.style.transform, opacity: 1 },
          { transform: "scale(0.25) rotate(35deg) translateY(40px)", opacity: 0, filter: "brightness(0.7)" },
        ],
        { duration: 380, easing: "cubic-bezier(0.6, 0, 0.8, 0.4)", fill: "forwards" },
      )
      .finished.then(() => removeClipping(c.url));
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-double border-ink pb-4">
        <div>
          <p className="kicker text-xs font-semibold text-accent">Cut out &amp; kept</p>
          <h1 className="intro-line overflow-hidden font-display text-[clamp(3rem,9vw,6rem)] uppercase leading-[0.9]">
            <span className="block">The scrapbook</span>
          </h1>
        </div>
        <p className="font-display text-5xl leading-none tabular-nums">
          {clippings.length}
          <span className="kicker ml-2 text-sm text-muted">{clippings.length === 1 ? "clipping" : "clippings"}</span>
        </p>
      </header>

      {clippings.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-none">Nothing clipped yet</p>
          <p className="mx-auto mt-4 max-w-md font-serif text-lg text-muted">
            Spot a story worth keeping? Hit <span className="kicker font-semibold text-ink">✂ Clip</span> under it in any edition and it lands
            here.
          </p>
          <Link href="/read/" transitionTypes={["nav-back"]} className={buttonClass("press", "xl", "mt-8")}>
            Go to my edition →
          </Link>
        </div>
      ) : (
        <>
          {topics.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter clippings by topic">
              <button type="button" aria-pressed={!active} onClick={() => setFilter(null)} className={chipClass(!active)}>
                All ({clippings.length})
              </button>
              {topics.map(([t, n]) => (
                <button key={t} type="button" aria-pressed={active === t} onClick={() => setFilter(t)} className={chipClass(active === t)}>
                  <span className="mr-1">{emojiFor(t)}</span>
                  {t} ({n})
                </button>
              ))}
            </div>
          )}

          <ul className="mt-12 grid items-start gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c, i) => (
              <li key={c.url}>
                <article
                  className="pin-in group relative transition-transform duration-300 hover:z-10 hover:!rotate-0 hover:-translate-y-1"
                  style={{ rotate: `${tilt(c.url, 2.2)}deg`, "--i": i } as React.CSSProperties}
                >
                  <span className="tape" style={{ rotate: `${tilt(c.url + "t", 6)}deg` }} aria-hidden />
                  <div className="pinked bg-surface px-5 drop-shadow-[0_6px_10px_rgb(0_0_0/0.18)]">
                    <p className="kicker text-[10px] font-semibold text-accent">
                      {emojiFor(c.topic)} {c.topic}
                    </p>
                    <a href={c.url} target="_blank" rel="noreferrer" className="headline-link mt-1 block font-serif text-xl font-bold leading-snug text-pretty">
                      {c.title}
                    </a>
                    <p className="kicker mt-2 text-[10px] tabular-nums text-muted">
                      {c.source} · {date(c.publishedAt)}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-line-strong pt-2">
                      <span className="kicker text-[10px] tabular-nums text-muted">Clipped {date(c.clippedAt)}</span>
                      <button
                        type="button"
                        onClick={(e) => unclip(c, e.currentTarget.closest("article"))}
                        className="kicker text-[10px] font-semibold text-muted hover:text-danger"
                        aria-label={`Unclip "${c.title}"`}
                      >
                        Unclip ✕
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
