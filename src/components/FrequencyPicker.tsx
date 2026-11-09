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
            className={`rounded-xl border p-4 text-left transition ${
              on ? "border-orange-700 bg-orange-50 ring-2 ring-orange-700/20" : "border-stone-300 bg-white hover:border-stone-500"
            }`}
          >
            <div className="font-semibold text-stone-900">{f.label}</div>
            <div className="mt-0.5 text-xs text-stone-500">{f.description}</div>
          </button>
        );
      })}
    </div>
  );
}
