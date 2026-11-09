import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { APP_NAME } from "./config";

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

let transporter: Transporter | null = null;

function smtp(): Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

/**
 * Sends through any SMTP server (Gmail app password, Brevo, etc. — all have free tiers).
 * Without SMTP configured (local dev), emails are written to ./.data/outbox and logged.
 */
export async function sendEmail(email: OutgoingEmail): Promise<void> {
  const t = smtp();
  if (t) {
    const fromAddress = process.env.EMAIL_FROM ?? process.env.SMTP_USER;
    await t.sendMail({
      from: `"${APP_NAME}" <${fromAddress}>`,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      headers: email.headers,
    });
    return;
  }

  if (process.env.VERCEL) throw new Error("SMTP_HOST is not configured.");

  const dir = path.join(process.cwd(), ".data", "outbox");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${email.to.replace(/[^a-z0-9]/gi, "_")}.html`);
  await writeFile(file, email.html);
  const links = [...email.html.matchAll(/href="(http:\/\/localhost[^"]+)"/g)].map((m) => m[1]);
  console.log(
    `\n📬 [dev email] to=${email.to}\n   subject: ${email.subject}\n   saved:   ${file}\n` +
      [...new Set(links)].map((l) => `   link:    ${l.replace(/&amp;/g, "&")}`).join("\n") + "\n",
  );
}
