"use client";

import { useEffect } from "react";
import { APP_NAME } from "@/lib/config";
import { frequencyInfo, type Frequency } from "@/lib/frequency";
import { emojiFor } from "@/lib/topics";

const DURATION_MS = 2100;

interface Props {
  topics: string[];
  frequency: Frequency;
  /** Called when the sheet is printed (or the reader skips). */
  onDone: () => void;
}

/**
 * The "go to press" moment: inked rollers spin, the press shudders, a fresh front page feeds
 * out with the reader's beats on it, and a red stamp thunks down. Click or any key skips.
 */
export function PressOverlay({ topics, frequency, onDone }: Props) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    const t = setTimeout(onDone, DURATION_MS);
    const skip = () => onDone();
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", skip);
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="assertive"
      onClick={onDone}
      className="press-overlay theme-day fixed inset-0 z-[70] flex cursor-pointer flex-col items-center overflow-hidden bg-ink text-paper"
    >
      <span className="sr-only">Printing your edition…</span>

      {/* The press: two inked rollers with the sheet feeding out between them */}
      <div className="press-shake relative mt-[12vh] w-[min(34rem,88vw)]" aria-hidden>
        <div className="press-roller relative z-10 h-9" />
        <div className="press-roller relative z-10 -mt-1 h-9" />

        <div className="relative -mt-2 h-[min(28rem,58vh)] overflow-hidden">
          <div className="press-sheet absolute inset-x-3 top-0 bg-surface px-6 pb-6 pt-4 text-ink shadow-2xl">
            <div className="kicker flex justify-between border-b border-ink pb-1 text-[9px] text-muted">
              <span>No. 1</span>
              <span>{frequencyInfo(frequency).label} edition</span>
            </div>
            <p className="py-2 text-center font-nameplate text-5xl leading-none">{APP_NAME}</p>
            <div className="rule-double" />
            <p className="mt-4 font-display text-4xl uppercase leading-[0.92]">Hot off the press: your {topics.length === 1 ? "beat" : "beats"}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <li key={t} className="kicker border border-ink px-2 py-1 text-[10px] font-medium">
                  {emojiFor(t)} {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2" aria-hidden>
              {[100, 92, 97, 60].map((w, i) => (
                <div key={i} className="h-2 bg-line" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="press-stamp stamp absolute bottom-8 right-6 rotate-[-9deg] px-3 py-1.5 font-display text-2xl uppercase tracking-wide text-accent">
              Printed!
            </div>
          </div>
        </div>
      </div>

      <p className="kicker mt-auto mb-8 text-xs text-line-strong">Stop the presses! Click to skip</p>
    </div>
  );
}
