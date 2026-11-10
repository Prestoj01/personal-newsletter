"use client";

import { useMemo } from "react";
import { buildSections } from "@/lib/edition";
import type { Frequency } from "@/lib/frequency";
import { Edition } from "./Edition";
import { useEditionSources } from "./useEditionSources";

export function PreviewPanel({ topics, frequency }: { topics: string[]; frequency: Frequency }) {
  const { sources, error } = useEditionSources(topics);
  // Only render once the loaded headlines cover every selected topic (avoids flashing empty sections).
  const ready = sources !== null && topics.every((t) => sources.topics.has(t));
  const sections = useMemo(() => (ready ? buildSections(sources, topics, frequency) : []), [ready, sources, topics, frequency]);

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 text-xs font-medium text-muted">Live preview</span>
      </div>
      <div className="h-[640px] overflow-y-auto bg-paper p-4 sm:p-6">
        {error ? (
          <Empty title="Couldn't load headlines" body={error} />
        ) : topics.length === 0 ? (
          <Empty title="Your newsletter, before you start it." body="Pick a few topics and a real preview with the latest headlines will appear here." />
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
