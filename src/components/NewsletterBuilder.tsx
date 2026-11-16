"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_TOPICS } from "@/lib/config";
import { ADD_TOPIC_EVENT } from "@/lib/events";
import { toDateKey, type Frequency } from "@/lib/frequency";
import { loadPrefs, savePrefs } from "@/lib/storage";
import { FrequencyPicker } from "./FrequencyPicker";
import { PressOverlay } from "./PressOverlay";
import { PreviewPanel } from "./PreviewPanel";
import { TopicPicker } from "./TopicPicker";
import { Button } from "./ui";

interface StepProps {
  n: number;
  title: string;
  /** Plain-language description under the section title. */
  dek: string;
  /** Status shown at the right of the step's header, next to what it describes. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** A builder step, set like a newspaper section: big red numeral, condensed title, rule above. */
function Step({ n, title, dek, aside, children, className = "" }: StepProps) {
  return (
    <section className={`rule-double pt-5 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="font-display text-6xl leading-[0.8] text-accent" aria-hidden>
            {n}
          </span>
          <div>
            <h2 className="font-display text-3xl uppercase leading-none tracking-wide text-ink">{title}</h2>
            <p className="mt-1 font-serif text-base text-muted">{dek}</p>
          </div>
        </div>
        {aside && <div className="shrink-0 pt-1">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export function NewsletterBuilder() {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [existing, setExisting] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const [printing, setPrinting] = useState(false);

  // On small screens the main button can be far below the topic list; mirror it in a sticky bar until it's on screen.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Returning readers edit their saved newsletter (localStorage is only available after mount).
  useEffect(() => {
    const prefs = loadPrefs();
    if (!prefs) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setTopics(prefs.topics);
    setFrequency(prefs.frequency);
    setExisting(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // The hero's cycling headline can add its topic directly.
  useEffect(() => {
    const onAdd = (e: Event) => {
      const topic = (e as CustomEvent<string>).detail;
      setTopics((cur) =>
        cur.some((t) => t.toLowerCase() === topic.toLowerCase()) || cur.length >= MAX_TOPICS ? cur : [...cur, topic],
      );
    };
    window.addEventListener(ADD_TOPIC_EVENT, onAdd);
    return () => window.removeEventListener(ADD_TOPIC_EVENT, onAdd);
  }, []);

  function start() {
    const prev = loadPrefs();
    const unchanged =
      prev && prev.frequency === frequency && prev.topics.length === topics.length && prev.topics.every((t, i) => t === topics[i]);
    // Changing anything starts a fresh schedule (and a new edition) today.
    savePrefs({ topics, frequency, startedAt: unchanged ? prev.startedAt : toDateKey(new Date()) });
    router.prefetch("/read/");
    setPrinting(true);
  }

  const goToEdition = useCallback(() => {
    // Open the fresh edition at its masthead, not at the scroll position of the builder.
    window.scrollTo({ top: 0, behavior: "instant" });
    router.push("/read/", { transitionTypes: ["nav-forward"] });
  }, [router]);

  const ctaLabel = `${existing ? "Reprint my edition" : "Print my edition"} →`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-10">
        <Step
          n={1}
          title="Pick your beats"
          dek={`Up to ${MAX_TOPICS} topics: teams, hobbies, people, anything.`}
          aside={
            <p data-fly-fallback className={`font-display text-3xl leading-none tabular-nums transition-colors ${topics.length >= MAX_TOPICS ? "text-accent" : "text-ink"}`}>
              {topics.length}
              <span className="text-lg text-muted">/{MAX_TOPICS}</span>
            </p>
          }
        >
          <TopicPicker selected={topics} onChange={setTopics} />
        </Step>

        <Step n={2} title="Set your print run" dek="How often a new edition arrives.">
          <FrequencyPicker value={frequency} onChange={setFrequency} />
        </Step>

        <Step n={3} title={existing ? "Reprint your paper" : "Go to press"} dek={existing ? "Save your changes and print a fresh edition." : "Print your first edition right now."}>
          <div ref={ctaRef}>
            <Button variant="press" size="xl" onClick={start} disabled={topics.length === 0} className="w-full">
              {ctaLabel}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            {topics.length === 0
              ? "Pick at least one topic to continue."
              : "No account or email needed. Your picks are saved in this browser, and a new edition appears here on your schedule."}
          </p>
        </Step>
      </div>

      <div className="lg:sticky lg:top-16 lg:self-start">
        <PreviewPanel topics={topics} frequency={frequency} />
      </div>

      {printing && <PressOverlay topics={topics} frequency={frequency} onDone={goToEdition} />}

      {topics.length > 0 && !ctaVisible && (
        <>
          {/* Spacer so the fixed bar never covers the end of the page. */}
          <div className="h-20 lg:hidden" aria-hidden />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-ink bg-paper/95 p-3 backdrop-blur lg:hidden">
            <Button variant="press" size="lg" onClick={start} className="w-full font-display text-xl">
              {ctaLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
