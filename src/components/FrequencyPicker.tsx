"use client";

import { FREQUENCIES, type Frequency } from "@/lib/frequency";

interface Props {
  value: Frequency;
  onChange: (f: Frequency) => void;
}

/** Each stamp sits a little crooked, like it was inked by hand. */
const TILTS = ["-3deg", "2deg", "-1.5deg", "3deg"];

export function FrequencyPicker({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="How often a new edition arrives" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {FREQUENCIES.map((f, i) => {
        const on = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(f.id)}
            className="group flex flex-col items-center gap-2 py-2 outline-none"
          >
            <span
              // Re-keying the selected stamp replays the "thunk" each time it's chosen.
              key={on ? `${f.id}-on` : f.id}
              style={{ "--tilt": TILTS[i], rotate: TILTS[i] } as React.CSSProperties}
              className={`stamp flex w-full items-center justify-center px-2 py-3 font-display text-xl uppercase tracking-wide transition-colors ${
                on
                  ? "stamp-press bg-accent/10 text-accent-strong"
                  : "text-ink/60 group-hover:text-ink group-focus-visible:text-ink"
              }`}
            >
              {f.label}
            </span>
            <span className={`kicker text-[10px] ${on ? "text-accent" : "text-muted"}`}>{f.description}</span>
          </button>
        );
      })}
    </div>
  );
}
