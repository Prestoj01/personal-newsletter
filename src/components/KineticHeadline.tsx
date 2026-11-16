"use client";

import { useEffect, useState } from "react";
import { requestAddTopic } from "@/lib/events";

/** What the banner headline cycles through: the word shown, and the topic it adds when clicked. */
const BEATS = [
  { word: "Lakers", topic: "Los Angeles Lakers" },
  { word: "Baking", topic: "Baking" },
  { word: "Mars missions", topic: "Space Exploration" },
  { word: "Taylor Swift", topic: "Taylor Swift" },
  { word: "Formula 1", topic: "Formula 1" },
  { word: "Birdwatching", topic: "Birdwatching" },
  { word: "Stock picks", topic: "Stock Market" },
  { word: "Video games", topic: "Video Games" },
  { word: "Chiefs", topic: "Kansas City Chiefs" },
  { word: "Gardening", topic: "Gardening" },
  { word: "AI", topic: "Artificial Intelligence" },
  { word: "Coffee", topic: "Coffee" },
];

const INTERVAL_MS = 2400;

export function KineticHeadline() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % BEATS.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(null), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const beat = BEATS[i];
  const prev = BEATS[(i - 1 + BEATS.length) % BEATS.length];

  return (
    <h1 className="font-display text-[clamp(3rem,8vw,6.75rem)] uppercase leading-[0.88] tracking-tight text-ink">
      <span className="intro-line block overflow-hidden" style={{ "--d": "250ms" } as React.CSSProperties}>
        <span className="block">The latest</span>
      </span>
      <span className="intro-line block overflow-hidden" style={{ "--d": "380ms" } as React.CSSProperties}>
        <span className="block">on your</span>
      </span>
      <span className="intro-line block overflow-hidden pb-[0.06em]" style={{ "--d": "510ms" } as React.CSSProperties}>
        <button
          type="button"
          onClick={() => {
            requestAddTopic(beat.topic);
            setAdded(beat.word);
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          title={`Add ${beat.topic} to my paper`}
          className="group relative inline-grid cursor-pointer text-left uppercase text-accent"
        >
          <span className="sr-only">Add {beat.topic} to my paper: </span>
          {/* Previous and current words share one grid cell: the old one flips up and out as the new one flips in. */}
          <span key={`out-${i}`} aria-hidden className="word-out col-start-1 row-start-1 whitespace-nowrap">
            {prev.word}
          </span>
          <span key={`in-${i}`} className="word-in col-start-1 row-start-1 whitespace-nowrap">
            {beat.word}.
          </span>
          <span
            aria-hidden
            className="kicker absolute -bottom-1 left-1 translate-y-full whitespace-nowrap text-xs font-medium tracking-[0.14em] text-muted opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {added ? `✓ Added ${added}` : `+ Add to my paper`}
          </span>
        </button>
      </span>
    </h1>
  );
}
