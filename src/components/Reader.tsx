"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { downloadReminder } from "@/lib/calendar";
import { buildSections } from "@/lib/edition";
import { currentEdition, frequencyInfo, fromDateKey, type EditionSlot } from "@/lib/frequency";
import { clearAll, loadEditions, loadPrefs, saveEdition, type Prefs, type StoredEdition } from "@/lib/storage";
import { Edition } from "./Edition";
import { useEditionSources } from "./useEditionSources";
import { Button, Card, Eyebrow, buttonClass } from "./ui";

const sameTopics = (a: string[], b: string[]) => a.length === b.length && a.every((t, i) => t === b[i]);

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }) =>
  d.toLocaleDateString("en-US", opts);

function untilText(next: Date): string {
  const today = new Date();
  const days = Math.round((next.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86_400_000);
  return days <= 1 ? "tomorrow" : `in ${days} days`;
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- derived from localStorage + fetched headlines */
    if (prefs === undefined) return;
    if (prefs === null) return setState({ kind: "empty" });
    if (!data) return;

    const slot = currentEdition(prefs.frequency, prefs.startedAt);
    let editions = loadEditions();
    const existing = editions.find((e) => e.key === slot.key && e.frequency === prefs.frequency && sameTopics(e.topics, prefs.topics));
    if (!existing) {
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
    setViewing(slot.key);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [prefs, data]);

  if (state.kind === "empty") {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="font-serif text-4xl">No newsletter yet</h1>
        <p className="mt-4 text-muted">Pick your topics and how often you want a new edition. It only takes a few seconds.</p>
        <Link href="/" className={buttonClass("primary", "lg", "mt-8")}>
          Create my newsletter
        </Link>
      </div>
    );
  }

  if (error) return <p className="py-24 text-center text-danger">{error}</p>;
  if (state.kind === "loading") return <p className="animate-pulse py-24 text-center font-serif text-2xl text-muted">Printing your edition…</p>;

  const { slot, editions } = state;
  const current = state.prefs;
  const shown = editions.find((e) => e.key === viewing) ?? editions[0];

  function startOver() {
    if (!confirm("Delete your topics and saved editions from this browser?")) return;
    clearAll();
    setPrefs(null);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        {shown.key !== slot.key && (
          <button onClick={() => setViewing(slot.key)} className="mb-4 text-sm text-accent underline">
            ← Back to the latest edition
          </button>
        )}
        <Edition
          sections={shown.sections}
          frequency={shown.frequency}
          date={fromDateKey(shown.key)}
          number={shown.number}
          asOf={shown.newsAsOf}
        />
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card className="p-5">
          <Eyebrow>Next edition</Eyebrow>
          <p className="mt-1 font-serif text-xl">{fmt(slot.next)}</p>
          <p className="text-sm text-muted">{untilText(slot.next)}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadReminder(current.frequency, slot.next, window.location.href)}
            className="mt-4 w-full"
          >
            Add reminders to my calendar
          </Button>
          <Link href="/" className={buttonClass("ghost", "sm", "mt-2 w-full")}>
            Edit topics or frequency
          </Link>
        </Card>

        {editions.length > 1 && (
          <Card className="p-2">
            <Eyebrow className="px-3 pb-2 pt-3">Past editions</Eyebrow>
            <ul className="space-y-1">
              {editions.map((e) => (
                <li key={e.key}>
                  <button
                    onClick={() => setViewing(e.key)}
                    className={`w-full rounded-item px-3 py-2 text-left text-sm ${e.key === shown.key ? "bg-accent-soft font-semibold text-accent-strong" : "hover:bg-paper"}`}
                  >
                    {fmt(fromDateKey(e.key), { month: "short", day: "numeric", year: "numeric" })}
                    <span className="ml-1 text-muted">
                      · {e.frequency !== current.frequency && `${frequencyInfo(e.frequency).label} `}No. {e.number}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <button onClick={startOver} className="text-xs text-muted underline hover:text-danger">
          Start over and clear my data
        </button>
      </aside>
    </div>
  );
}
