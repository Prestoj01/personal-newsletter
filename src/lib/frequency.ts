export const FREQUENCIES = [
  { id: "daily", label: "Daily", description: "Every morning", days: 1 },
  { id: "weekly", label: "Weekly", description: "Once a week", days: 7 },
  { id: "biweekly", label: "Biweekly", description: "Every 2 weeks", days: 14 },
  { id: "monthly", label: "Monthly", description: "Once a month", days: 30 },
] as const;

export type Frequency = (typeof FREQUENCIES)[number]["id"];

export function isFrequency(value: unknown): value is Frequency {
  return FREQUENCIES.some((f) => f.id === value);
}

export function frequencyInfo(f: Frequency) {
  return FREQUENCIES.find((x) => x.id === f)!;
}

/** How far back to look for news, in days. */
export function lookbackDays(f: Frequency): number {
  return frequencyInfo(f).days;
}

/**
 * Next delivery date. Snapped to midnight UTC so the once-a-day cron
 * reliably picks the subscriber up on the due day regardless of what
 * time of day they signed up.
 */
export function nextSendAt(f: Frequency, from: Date = new Date()): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  if (f === "monthly") d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCDate(d.getUTCDate() + frequencyInfo(f).days);
  return d;
}
