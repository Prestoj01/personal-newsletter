"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toDateKey, type Frequency } from "@/lib/frequency";
import { loadPrefs, savePrefs } from "@/lib/storage";
import { FrequencyPicker } from "./FrequencyPicker";
import { PreviewPanel } from "./PreviewPanel";
import { TopicPicker } from "./TopicPicker";
import { Button, Card } from "./ui";

function Step({ n, title, children, className = "" }: { n: number; title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`p-6 sm:p-8 ${className}`}>
      <h2 className="mb-5 flex items-center gap-3 font-serif text-2xl text-ink">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-sans text-sm font-semibold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

export function NewsletterBuilder() {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [existing, setExisting] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);

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

  function start() {
    const prev = loadPrefs();
    const unchanged =
      prev && prev.frequency === frequency && prev.topics.length === topics.length && prev.topics.every((t, i) => t === topics[i]);
    // Changing anything starts a fresh schedule (and a new edition) today.
    savePrefs({ topics, frequency, startedAt: unchanged ? prev.startedAt : toDateKey(new Date()) });
    router.push("/read/");
  }

  const count = topics.length ? ` with ${topics.length} topic${topics.length === 1 ? "" : "s"}` : "";
  const ctaLabel = `${existing ? "Update my newsletter" : "Create my newsletter"}${count} →`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-6">
        <Step n={1} title="Pick up to 12 topics">
          <TopicPicker selected={topics} onChange={setTopics} />
        </Step>

        <Step n={2} title="Choose how often a new edition arrives">
          <FrequencyPicker value={frequency} onChange={setFrequency} />
        </Step>

        <Step n={3} title={existing ? "Save your changes" : "Create your newsletter"} className="border-accent/40 bg-accent-soft">
          <div ref={ctaRef}>
            <Button size="lg" onClick={start} disabled={topics.length === 0} className="w-full py-4 text-lg">
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

      <div className="lg:sticky lg:top-6 lg:self-start">
        <PreviewPanel topics={topics} frequency={frequency} />
      </div>

      {topics.length > 0 && !ctaVisible && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 p-3 backdrop-blur lg:hidden">
          <Button size="lg" onClick={start} className="w-full">
            {ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
