import "server-only";
import { siteUrl } from "./config";
import { sendEmail } from "./email";
import { buildSections } from "./news";
import { renderNewsletter } from "./templates";
import { claimDue, recordSent, releaseClaim, type Subscriber } from "./subscribers";

export const manageUrl = (token: string) => `${siteUrl()}/manage?token=${encodeURIComponent(token)}`;
const oneClickUrl = (token: string) => `${siteUrl()}/api/unsubscribe?token=${encodeURIComponent(token)}`;

/** Build and send one issue. Returns false if there was no news to send. */
export async function deliverIssue(sub: Subscriber): Promise<boolean> {
  const sections = await buildSections(sub.topics, sub.frequency);
  const issue = renderNewsletter({ sections, frequency: sub.frequency, manageUrl: manageUrl(sub.token) });
  if (issue.total === 0) return false;

  await sendEmail({
    to: sub.email,
    subject: issue.subject,
    html: issue.html,
    text: issue.text,
    headers: {
      "List-Unsubscribe": `<${oneClickUrl(sub.token)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  return true;
}

export interface RunSummary {
  claimed: number;
  sent: number;
  skipped: number;
  failed: number;
}

/** Send every issue that's due. Called by the daily cron. */
export async function runDueDeliveries(limit = 100, concurrency = 3): Promise<RunSummary> {
  const due = await claimDue(limit);
  const summary: RunSummary = { claimed: due.length, sent: 0, skipped: 0, failed: 0 };

  let cursor = 0;
  async function worker() {
    while (cursor < due.length) {
      const sub = due[cursor++];
      try {
        const sent = await deliverIssue(sub);
        await recordSent(sub.id, sub.frequency);
        summary[sent ? "sent" : "skipped"]++;
      } catch (err) {
        console.error(`[cron] delivery failed for subscriber ${sub.id}:`, err);
        await releaseClaim(sub.id, sub.previous_next_send_at).catch(() => {});
        summary.failed++;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, due.length) }, worker));
  return summary;
}
