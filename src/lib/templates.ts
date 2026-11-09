import { APP_NAME } from "./config";
import { frequencyInfo, type Frequency } from "./frequency";
import type { TopicSection } from "./news";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const INK = "#1c1917";
const MUTED = "#78716c";
const ACCENT = "#c2410c";
const PAPER = "#faf7f2";

function relativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

function shell(title: string, preheader: string, body: string, footer: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e7e5e4;border-radius:14px;font-family:Georgia,'Times New Roman',serif;color:${INK};">
${body}
</table>
<p style="max-width:600px;margin:20px auto 0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">${footer}</p>
</td></tr></table></body></html>`;
}

function masthead(kicker: string, headline: string): string {
  return `<tr><td style="padding:32px 36px 20px;border-bottom:3px double ${INK};">
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${ACCENT};font-weight:700;">${esc(kicker)}</div>
<div style="font-size:34px;line-height:1.1;font-weight:700;margin-top:6px;">${esc(APP_NAME)}</div>
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:13px;color:${MUTED};margin-top:8px;">${esc(headline)}</div>
</td></tr>`;
}

export interface NewsletterOptions {
  sections: TopicSection[];
  frequency: Frequency;
  manageUrl?: string;
  date?: Date;
}

export function renderNewsletter({ sections, frequency, manageUrl, date = new Date() }: NewsletterOptions) {
  const freq = frequencyInfo(frequency);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  const total = sections.reduce((n, s) => n + s.articles.length, 0);
  const subject = `Your ${freq.label.toLowerCase()} brief: ${sections.slice(0, 3).map((s) => s.topic).join(", ")}${sections.length > 3 ? " & more" : ""}`;

  const toc = sections
    .filter((s) => s.articles.length)
    .map((s) => `${s.emoji} ${esc(s.topic)}`)
    .join(" &nbsp;·&nbsp; ");

  const body = sections
    .map((s) => {
      const items = s.articles.length
        ? s.articles
            .map(
              (a, i) => `<tr><td style="padding:12px 0;${i ? "border-top:1px solid #f0eeec;" : ""}">
<a href="${esc(a.url)}" style="font-size:18px;line-height:1.35;color:${INK};text-decoration:none;font-weight:600;">${esc(a.title)}</a>
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;color:${MUTED};margin-top:4px;">${esc(a.source)} · ${relativeTime(a.publishedAt)}</div>
</td></tr>`,
            )
            .join("")
        : `<tr><td style="padding:12px 0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;color:${MUTED};font-style:italic;">A quiet stretch — no new stories this period.</td></tr>`;
      return `<tr><td style="padding:24px 36px 4px;">
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;color:${ACCENT};border-bottom:1px solid #e7e5e4;padding-bottom:8px;">${s.emoji} ${esc(s.topic)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
</td></tr>`;
    })
    .join("");

  const html = shell(
    subject,
    `${total} stories on ${sections.map((s) => s.topic).join(", ")}`,
    masthead(`${freq.label} edition`, dateStr) +
      (toc ? `<tr><td style="padding:16px 36px 0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:13px;color:${MUTED};">In this issue: ${toc}</td></tr>` : "") +
      body +
      `<tr><td style="padding:24px 36px 32px;"></td></tr>`,
    manageUrl
      ? `You're receiving this because you subscribed to ${esc(APP_NAME)}.<br><a href="${esc(manageUrl)}" style="color:${MUTED};">Change topics or frequency</a> &nbsp;·&nbsp; <a href="${esc(manageUrl)}#unsubscribe" style="color:${MUTED};">Unsubscribe</a>`
      : `This is a preview of your ${esc(APP_NAME)} newsletter.`,
  );

  const text = [
    `${APP_NAME} — ${freq.label} edition — ${dateStr}`,
    "",
    ...sections.flatMap((s) => [
      `== ${s.topic.toUpperCase()} ==`,
      ...(s.articles.length ? s.articles.map((a) => `• ${a.title} (${a.source})\n  ${a.url}`) : ["(no new stories)"]),
      "",
    ]),
    manageUrl ? `Manage preferences or unsubscribe: ${manageUrl}` : "",
  ].join("\n");

  return { subject, html, text, total };
}

function simpleEmail(kicker: string, heading: string, paragraphs: string[], cta: { label: string; url: string }) {
  return shell(
    heading,
    paragraphs[0] ?? heading,
    masthead(kicker, heading) +
      `<tr><td style="padding:28px 36px 36px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${INK};">
${paragraphs.map((p) => `<p style="margin:0 0 16px;">${p}</p>`).join("")}
<a href="${esc(cta.url)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">${esc(cta.label)}</a>
<p style="margin:24px 0 0;font-size:12px;color:${MUTED};">Or paste this link into your browser:<br><a href="${esc(cta.url)}" style="color:${MUTED};word-break:break-all;">${esc(cta.url)}</a></p>
</td></tr>`,
    `If you didn't request this, you can safely ignore this email.`,
  );
}

export function renderConfirmation(confirmUrl: string, topics: string[], frequency: Frequency) {
  const freq = frequencyInfo(frequency).label.toLowerCase();
  const html = simpleEmail(
    "One more step",
    "Confirm your subscription",
    [
      `You asked for a <strong>${esc(freq)}</strong> newsletter about <strong>${topics.map(esc).join(", ")}</strong>.`,
      "Click below to confirm and we'll send your first issue right away.",
    ],
    { label: "Confirm subscription", url: confirmUrl },
  );
  const text = `Confirm your ${APP_NAME} subscription (${freq}: ${topics.join(", ")}):\n${confirmUrl}\n\nIf you didn't request this, ignore this email.`;
  return { subject: `Confirm your ${APP_NAME} subscription`, html, text };
}

export function renderAlreadySubscribed(manageUrl: string) {
  const html = simpleEmail(
    "You're already in",
    "You already have a subscription",
    ["Someone (hopefully you) tried to sign up again with this address. To change your topics or how often you hear from us, use the link below."],
    { label: "Manage my newsletter", url: manageUrl },
  );
  const text = `You're already subscribed to ${APP_NAME}. Manage your preferences: ${manageUrl}`;
  return { subject: `Manage your ${APP_NAME} subscription`, html, text };
}
