export const FREQUENCIES = [
  { id: "daily", label: "Daily", description: "A new edition every day", days: 1 },
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

/** Local calendar date as YYYY-MM-DD. */
export function toDateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const DAY = 86_400_000;
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY);

function addMonths(anchor: Date, n: number): Date {
  const target = new Date(anchor.getFullYear(), anchor.getMonth() + n, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(anchor.getDate(), lastDay));
  return target;
}

export interface EditionSlot {
  /** Edition number, starting at 1 on the day the reader subscribed. */
  number: number;
  /** Date this edition was "published" (YYYY-MM-DD). */
  key: string;
  date: Date;
  next: Date;
}

/**
 * Which edition is current for a reader who started on `startedAt`.
 * Editions publish every N days (or on the same day each month), counted from the start date.
 */
export function currentEdition(f: Frequency, startedAt: string, now: Date = new Date()): EditionSlot {
  const anchor = fromDateKey(startedAt);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let n: number;
  let date: Date;
  let next: Date;
  if (f === "monthly") {
    n = (today.getFullYear() - anchor.getFullYear()) * 12 + today.getMonth() - anchor.getMonth();
    if (addMonths(anchor, n) > today) n--;
    n = Math.max(0, n);
    date = addMonths(anchor, n);
    next = addMonths(anchor, n + 1);
  } else {
    const period = frequencyInfo(f).days;
    n = Math.max(0, Math.floor(daysBetween(anchor, today) / period));
    date = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + n * period);
    next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + period);
  }
  return { number: n + 1, key: toDateKey(date), date, next };
}
