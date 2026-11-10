"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toDateKey, type Frequency } from "@/lib/frequency";
import { loadPrefs, savePrefs } from "@/lib/storage";
import { FrequencyPicker } from "./FrequencyPicker";
import { PreviewPanel } from "./PreviewPanel";
import { TopicPicker } from "./TopicPicker";
import { Button, Card } from "./ui";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 sm:p-8">
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Step n={1} title="Pick up to 12 topics">
          <TopicPicker selected={topics} onChange={setTopics} />
        </Step>

        <Step n={2} title="Choose how often a new edition arrives">
          <FrequencyPicker value={frequency} onChange={setFrequency} />
        </Step>

        <Step n={3} title={existing ? "Save your changes" : "Create your newsletter"}>
          <Button size="lg" onClick={start} disabled={topics.length === 0} className="w-full sm:w-auto">
            {existing ? "Update my newsletter →" : "Create my newsletter →"}
          </Button>
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
    </div>
  );
}
