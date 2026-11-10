"use client";

import { useState } from "react";
import { MAX_TOPICS } from "@/lib/config";
import { Eyebrow, buttonClass, chipClass, inputClass } from "./ui";
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
          <Eyebrow className="mb-2">{group.name}</Eyebrow>
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
                  className={chipClass(on)}
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
        <Eyebrow className="mb-2">Something else?</Eyebrow>
        <form onSubmit={addCustom} className="flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={60}
            list="topic-suggestions"
            placeholder="e.g. Taylor Swift, Lakers, sourdough"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={atLimit || custom.trim().length < 2}
            className={buttonClass("secondary", "sm")}
          >
            Add
          </button>
          <datalist id="topic-suggestions">
            {CATALOG.map((t) => (
              <option key={t.label} value={t.label} />
            ))}
          </datalist>
        </form>
        <p className="mt-2 text-xs text-muted">
          Start typing for 100+ suggestions (teams, companies, people, hobbies). Anything else is matched against thousands of fresh headlines, so very niche topics may be quiet some days.
        </p>
        {customTopics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customTopics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggle(t)}
                className={chipClass(true)}
                aria-label={`Remove ${t}`}
              >
                {emojiFor(t)} {t} <span className="ml-1 opacity-70">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-muted">
        {selected.length} of {MAX_TOPICS} selected{atLimit && " — that's the max"}
      </p>
    </div>
  );
}
