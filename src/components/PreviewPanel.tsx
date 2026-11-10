"use client";

import { useMemo } from "react";
import { buildSections } from "@/lib/edition";
import type { Frequency } from "@/lib/frequency";
import { Edition } from "./Edition";
import { useEditionSources } from "./useEditionSources";

/** Shown before anyone picks a topic, so visitors see a real edition instead of an empty box. */
const EXAMPLE_TOPICS = ["Artificial Intelligence", "NBA", "Cooking", "Space Exploration"];

export function PreviewPanel({ topics: picked, frequency }: { topics: string[]; frequency: Frequency }) {
  const isExample = picked.length === 0;
  const topics = isExample ? EXAMPLE_TOPICS : picked;
  const { sources, error } = useEditionSources(topics);
  // Only render once the loaded headlines cover every selected topic (avoids flashing empty sections).
  const ready = sources !== null && topics.every((t) => sources.topics.has(t));
  const sections = useMemo(() => (ready ? buildSections(sources, topics, frequency) : []), [ready, sources, topics, frequency]);

  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-surface lg:h-[calc(100vh-3rem)]">
      <div className="border-b border-line px-4 py-2.5">
        <span className="text-xs font-medium text-muted">
          {isExample ? "Example edition: pick topics to make it yours" : "Live preview"}
        </span>
      </div>
      <div className="h-[600px] min-h-0 overflow-y-auto bg-paper p-4 sm:p-6 lg:h-auto lg:flex-1">
        {error ? (
          <Empty title="Couldn't load headlines" body={error} />
        ) : !ready ? (
          <Empty title="Gathering headlines…" />
        ) : (
          <Edition sections={sections} frequency={frequency} date={new Date()} asOf={sources.generatedAt} />
        )}
      </div>
    </div>
  );
}

function Empty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center text-muted">
      <p className="font-serif text-2xl text-ink">{title}</p>
      {body && <p className="mt-2 text-sm">{body}</p>}
    </div>
  );
}
