"use client";

import { useState } from "react";
import { MAX_TOPICS } from "@/lib/config";
import { TOPIC_GROUPS, presetFor } from "@/lib/topics";

interface Props {
  selected: string[];
  onChange: (topics: string[]) => void;
}

export function TopicPicker({ selected, onChange }: Props) {
  const [custom, setCustom] = useState("");
  const selectedKeys = new Set(selected.map((t) => t.toLowerCase()));
  const atLimit = selected.length >= MAX_TOPICS;
  const customTopics = selected.filter((t) => !presetFor(t));

  function toggle(label: string) {
    if (selectedKeys.has(label.toLowerCase())) {
      onChange(selected.filter((t) => t.toLowerCase() !== label.toLowerCase()));
    } else if (!atLimit) {
      onChange([...selected, label]);
    }
  }

  function addCustom(e: React.FormEvent) {
    e.preventDefault();
    const value = custom.replace(/\s+/g, " ").trim();
    if (value.length < 2 || value.length > 60 || atLimit) return;
    if (!selectedKeys.has(value.toLowerCase())) onChange([...selected, value]);
    setCustom("");
  }

  return (
    <div className="space-y-6">
      {TOPIC_GROUPS.map((group) => (
        <div key={group.name}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">{group.name}</h3>
          <div className="flex flex-wrap gap-2">
            {group.topics.map((t) => {
              const on = selectedKeys.has(t.label.toLowerCase());
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => toggle(t.label)}
                  disabled={!on && atLimit}
                  aria-pressed={on}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                    on
                      ? "border-orange-700 bg-orange-700 text-white shadow-sm"
                      : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-40"
                  }`}
                >
                  <span className="mr-1.5">{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">Something else?</h3>
        <form onSubmit={addCustom} className="flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={60}
            placeholder="e.g. Taylor Swift, sourdough, Kansas City Chiefs"
            className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-700 focus:ring-2 focus:ring-orange-700/20"
          />
          <button
            type="submit"
            disabled={atLimit || custom.trim().length < 2}
            className="rounded-full border border-stone-800 px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </form>
        {customTopics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customTopics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggle(t)}
                className="rounded-full border border-orange-700 bg-orange-700 px-3.5 py-1.5 text-sm text-white"
                aria-label={`Remove ${t}`}
              >
                ✨ {t} <span className="ml-1 opacity-70">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-stone-500">
        {selected.length} of {MAX_TOPICS} selected{atLimit && " — that's the max"}
      </p>
    </div>
  );
}
