import { APP_NAME } from "./config";
import type { Frequency } from "./frequency";

const RRULES: Record<Frequency, string> = {
  daily: "FREQ=DAILY",
  weekly: "FREQ=WEEKLY",
  biweekly: "FREQ=WEEKLY;INTERVAL=2",
  monthly: "FREQ=MONTHLY",
};

const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** A recurring all-day calendar reminder for each new edition. Static sites can't send email; calendars can still remind you. */
export function downloadReminder(frequency: Frequency, firstDate: Date, readUrl: string) {
  const next = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + 1);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${APP_NAME}//EN`,
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@personal-press`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(firstDate)}`,
    `DTEND;VALUE=DATE:${ymd(next)}`,
    `RRULE:${RRULES[frequency]}`,
    `SUMMARY:📰 New ${APP_NAME} edition`,
    `DESCRIPTION:Your new edition is ready: ${readUrl}`,
    `URL:${readUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "personal-press-reminder.ics" });
  a.click();
  URL.revokeObjectURL(url);
}
