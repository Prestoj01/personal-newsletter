"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { downloadReminder } from "@/lib/calendar";
import { buildSections } from "@/lib/edition";
import { currentEdition, frequencyInfo, fromDateKey, type EditionSlot } from "@/lib/frequency";
import { clearAll, loadEditions, loadPrefs, saveEdition, type Prefs, type StoredEdition } from "@/lib/storage";
import { Edition, EditionSkeleton } from "./Edition";
import { ShareButton } from "./ShareButton";
import { useEditionSources } from "./useEditionSources";
import { Button, Eyebrow, buttonClass } from "./ui";

const sameTopics = (a: string[], b: string[]) => a.length === b.length && a.every((t, i) => t === b[i]);

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }) =>
  d.toLocaleDateString("en-US", opts);

function daysUntil(next: Date): number {
  const today = new Date();
  return Math.max(1, Math.round((next.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86_400_000));
}

type State =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "ready"; prefs: Prefs; slot: EditionSlot; editions: StoredEdition[] };

export function Reader() {
  const [prefs, setPrefs] = useState<Prefs | null | undefined>(undefined);
  const { sources: data, error } = useEditionSources(prefs?.topics ?? null);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [viewing, setViewing] = useState<string | null>(null);
  const [reminderSaved, setReminderSaved] = useState(false);

  useEffect(() => {
    if (!reminderSaved) return;
    const t = setTimeout(() => setReminderSaved(false), 2500);
    return () => clearTimeout(t);
  }, [reminderSaved]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- derived from localStorage + fetched headlines */
    if (prefs === undefined) return;
    if (prefs === null) return setState({ kind: "empty" });

    const slot = currentEdition(prefs.frequency, prefs.startedAt);
    let editions = loadEditions();
    const existing = editions.find((e) => e.key === slot.key && e.frequency === prefs.frequency && sameTopics(e.topics, prefs.topics));
    // Today's edition is already printed and saved: show it right away (and offline) without waiting for headlines.
    if (!existing && !data) return;
    if (!existing && data) {
      // Today is a publish day for this reader (or their first visit since): print the new edition.
      editions = saveEdition({
        key: slot.key,
        number: slot.number,
        frequency: prefs.frequency,
        topics: prefs.topics,
        createdAt: new Date().toISOString(),
        newsAsOf: data.generatedAt,
        sections: buildSections(data, prefs.topics, prefs.frequency),
      });
    }
    setState({ kind: "ready", prefs, slot, editions });
    setViewing((v) => v ?? slot.key); // keep an archived edition open if the reader already picked one
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [prefs, data]);

  if (state.kind === "empty") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="kicker text-xs font-semibold text-accent">Nothing on the newsstand yet</p>
        <h1 className="intro-line mt-3 overflow-hidden font-display text-[clamp(3.5rem,12vw,8rem)] uppercase leading-[0.9]">
          <span className="block">No paper today</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md font-serif text-lg text-muted">
          Pick your beats and how often you want a new edition. Your first one is printed in seconds.
        </p>
        <Link href="/" transitionTypes={["nav-back"]} className={buttonClass("press", "xl", "mt-8")}>
          Start my paper →
        </Link>
      </div>
    );
  }

  if (state.kind === "loading" && error) {
    return (
      <p className="py-24 text-center text-danger">
        {typeof navigator !== "undefined" && !navigator.onLine ? "You're offline, and this edition hasn't been printed on this device yet." : error}
      </p>
    );
  }
  if (state.kind === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6 lg:pr-[312px]">
        <EditionSkeleton />
      </div>
    );
  }

  const { slot, editions } = state;
  const current = state.prefs;
  const shown = editions.find((e) => e.key === viewing) ?? editions[0];
  const days = daysUntil(slot.next);

  function startOver() {
    if (!confirm("Delete your topics and saved editions from this browser?")) return;
    clearAll();
    setPrefs(null);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px] print:block print:max-w-none print:p-0">
      <div>
        {shown.key !== slot.key && (
          <button onClick={() => setViewing(slot.key)} className="print:hidden kicker mb-4 text-xs font-semibold text-accent hover:underline">
            ← Back to the latest edition
          </button>
        )}
        <div key={shown.key} className="unfold">
          <Edition
            sections={shown.sections}
            frequency={shown.frequency}
            date={fromDateKey(shown.key)}
            number={shown.number}
            asOf={shown.newsAsOf}
          />
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-16 lg:self-start print:hidden">
        {/* The "ear": the box beside a nameplate that tells you when the next edition lands. */}
        <section className="intro-fade border-4 border-double border-ink bg-surface p-5 text-center" style={{ "--d": "300ms" } as React.CSSProperties}>
          <Eyebrow>Next edition rolls off the press</Eyebrow>
          <p className="mt-3 font-display text-7xl leading-none tabular-nums text-accent">
            <span key={days} className="inline-block motion-safe:animate-pop-in">
              {days}
            </span>
          </p>
          <p className="kicker mt-1 text-sm font-semibold">{days === 1 ? "day to go" : "days to go"}</p>
          <p className="mt-2 border-t border-ink pt-2 font-serif text-base text-muted">{fmt(slot.next)}</p>
          <Button
            variant="press"
            size="sm"
            onClick={() => {
              downloadReminder(current.frequency, slot.next, window.location.href);
              setReminderSaved(true);
            }}
            className="mt-4 w-full"
            aria-live="polite"
          >
            {reminderSaved ? <span className="motion-safe:animate-pop-in">✓ Reminder downloaded</span> : "Add reminders to my calendar"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()} className="mt-2 w-full">
            Print a paper copy
          </Button>
          <ShareButton paper={current} variant="ghost" className="w-full" />
          <Link href="/" transitionTypes={["nav-back"]} className={buttonClass("ghost", "sm", "w-full")}>
            Edit topics or frequency
          </Link>
        </section>

        {editions.length > 1 && (
          <section className="intro-fade" style={{ "--d": "450ms" } as React.CSSProperties}>
            <div className="rule-double pt-3">
              <h2 className="font-display text-3xl uppercase leading-none">The morgue</h2>
              <p className="font-serif text-sm text-muted">Every past edition, filed away.</p>
            </div>
            {/* Past editions as a stack of folded papers: each spine shows its date and number. */}
            <ul className="mt-3 tabular-nums">
              {editions.map((e, i) => {
                const active = e.key === shown.key;
                return (
                  <li key={e.key} style={{ marginLeft: `${Math.min(i, 4) * 4}px` }}>
                    <button
                      onClick={() => setViewing(e.key)}
                      aria-current={active ? "true" : undefined}
                      className={`group -mt-px flex w-full items-center gap-3 border border-ink px-3 py-2 text-left transition-transform duration-200 hover:translate-x-1.5 ${
                        active ? "bg-ink text-paper" : "bg-surface hover:bg-paper"
                      }`}
                    >
                      <span className={`font-nameplate text-lg leading-none ${active ? "text-paper" : "text-accent"}`} aria-hidden>
                        EE
                      </span>
                      <span className="flex-1 font-serif text-sm">{fmt(fromDateKey(e.key), { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span className={`kicker text-[10px] ${active ? "text-line" : "text-muted"}`}>
                        {e.frequency !== current.frequency && `${frequencyInfo(e.frequency).label} `}No. {e.number}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <button onClick={startOver} className="kicker text-[11px] text-muted underline hover:text-danger">
          Start over and clear my data
        </button>
      </aside>
    </div>
  );
}
