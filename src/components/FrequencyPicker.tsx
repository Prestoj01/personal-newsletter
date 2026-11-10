"use client";

import { FREQUENCIES, type Frequency } from "@/lib/frequency";

interface Props {
  value: Frequency;
  onChange: (f: Frequency) => void;
}

export function FrequencyPicker({ value, onChange }: Props) {
  return (
    <div role="radiogroup" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {FREQUENCIES.map((f) => {
        const on = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(f.id)}
            className={`rounded-control border p-4 text-left transition ${
              on ? "border-accent bg-accent-soft ring-2 ring-accent/20" : "border-line-strong bg-surface hover:border-muted"
            }`}
          >
            <div className="font-semibold text-ink">{f.label}</div>
            <div className="mt-0.5 text-xs text-muted">{f.description}</div>
          </button>
        );
      })}
    </div>
  );
}
