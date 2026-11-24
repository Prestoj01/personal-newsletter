"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { buildSections } from "@/lib/edition";
import { frequencyInfo, toDateKey } from "@/lib/frequency";
import { encodeShare, type SharedPaper } from "@/lib/share";
import { loadPrefs, savePrefs } from "@/lib/storage";
import { Edition, EditionSkeleton } from "./Edition";
import { ShareButton } from "./ShareButton";
import { useEditionSources } from "./useEditionSources";
import { Button, Eyebrow, buttonClass } from "./ui";

/** A paper someone shared by link: built live from current headlines, nothing saved until you keep it. */
export function SharedPaperView({ paper }: { paper: SharedPaper }) {
  const router = useRouter();
  const { sources, error } = useEditionSources(paper.topics);
  const ready = sources !== null && paper.topics.every((t) => sources.topics.has(t));
  const sections = useMemo(() => (ready ? buildSections(sources, paper.topics, paper.frequency) : []), [ready, sources, paper]);
  const freq = frequencyInfo(paper.frequency).label.toLowerCase();

  function keep() {
    const mine = loadPrefs();
    if (mine && !confirm(`Replace your current paper (${mine.topics.length} beats) with this one?`)) return;
    savePrefs({
      topics: paper.topics,
      frequency: paper.frequency,
      startedAt: toDateKey(new Date()),
    });
    window.scrollTo({ top: 0, behavior: "instant" });
    router.replace("/read/", { transitionTypes: ["nav-forward"] });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        {error ? (
          <p className="py-24 text-center text-danger">{error}</p>
        ) : ready ? (
          <div className="unfold">
            <Edition sections={sections} frequency={paper.frequency} date={new Date()} asOf={sources.generatedAt} badge="Shared paper" />
          </div>
        ) : (
          <EditionSkeleton />
        )}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-16 lg:self-start">
        <section
          className="intro-fade border-4 border-double border-ink bg-surface p-5 text-center"
          style={{ "--d": "300ms" } as React.CSSProperties}
        >
          <Eyebrow className="text-accent">Shared with you</Eyebrow>
          <p className="mt-2 font-display text-3xl uppercase leading-none">Like this paper?</p>
          <p className="mt-2 font-serif text-base text-muted">
            Keep it, and a fresh {freq} edition will be printed here for you. No account needed.
          </p>
          <Button variant="press" size="sm" onClick={keep} className="mt-4 w-full">
            Make it my paper →
          </Button>
          <Link href={`/?${encodeShare(paper)}`} transitionTypes={["nav-back"]} className={buttonClass("ghost", "sm", "mt-2 w-full")}>
            Customize it first
          </Link>
          <ShareButton paper={paper} variant="ghost" className="w-full" />
        </section>
      </aside>
    </div>
  );
}
