"use client";

import { useState } from "react";
import { MAX_TOPICS } from "@/lib/config";
import { CATALOG, TOPIC_GROUPS, emojiFor, isChipTopic, presetFor } from "@/lib/topics";

interface Props {
  selected: string[];
  onChange: (topics: string[]) => void;
}

export function TopicPicker({ selected, onChange }: Props) {
  const [custom, setCustom] = useState("");
  const selectedKeys = new Set(selected.map((t) => t.toLowerCase()));
  const atLimit = selected.length >= MAX_TOPICS;
  const customTopics = selected.filter((t) => !isChipTopic(t));

  function toggle(label: string) {
    if (selectedKeys.has(label.toLowerCase())) {
      onChange(selected.filter((t) => t.toLowerCase() !== label.toLowerCase()));
    } else if (!atLimit) {
      onChange([...selected, label]);
    }
  }

  function addCustom(e: React.FormEvent) {
    e.preventDefault();
    const typed = custom.replace(/\s+/g, " ").trim();
    if (typed.length < 2 || typed.length > 60 || atLimit) return;
    // "chiefs" -> "Kansas City Chiefs", so known topics get their dedicated feed.
    const value = presetFor(typed)?.label ?? typed;
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
            list="topic-suggestions"
            placeholder="e.g. Taylor Swift, Lakers, sourdough"
            className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-700 focus:ring-2 focus:ring-orange-700/20"
          />
          <button
            type="submit"
            disabled={atLimit || custom.trim().length < 2}
            className="rounded-full border border-stone-800 px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
          <datalist id="topic-suggestions">
            {CATALOG.map((t) => (
              <option key={t.label} value={t.label} />
            ))}
          </datalist>
        </form>
        <p className="mt-2 text-xs text-stone-500">
          Start typing for 100+ suggestions (teams, companies, people, hobbies). Anything else is matched against thousands of fresh headlines, so very niche topics may be quiet some days.
        </p>
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
                {emojiFor(t)} {t} <span className="ml-1 opacity-70">×</span>
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
