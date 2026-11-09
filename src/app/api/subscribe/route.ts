import { siteUrl } from "@/lib/config";
import { manageUrl } from "@/lib/delivery";
import { sendEmail } from "@/lib/email";
import { findByEmail, markConfirmationSent, upsertPending } from "@/lib/subscribers";
import { renderAlreadySubscribed, renderConfirmation } from "@/lib/templates";
import { badRequest, normalizeEmail, normalizeFrequency, normalizeTopics } from "@/lib/validation";

const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ok = Response.json({ ok: true });

  // Honeypot: real users never fill the hidden "website" field.
  if (body?.website) return ok;

  const email = normalizeEmail(body?.email);
  const topics = normalizeTopics(body?.topics);
  const frequency = normalizeFrequency(body?.frequency);
  if (!email) return badRequest("Please enter a valid email address.");
  if (!topics) return badRequest("Pick at least one topic.");
  if (!frequency) return badRequest("Pick a frequency.");

  const existing = await findByEmail(email);

  // Throttle repeat requests so the form can't be used to spam an inbox.
  // The response is identical either way, so it doesn't reveal who is subscribed.
  if (existing?.confirmation_sent_at && Date.now() - existing.confirmation_sent_at.getTime() < RESEND_COOLDOWN_MS) {
    return ok;
  }

  try {
    if (existing?.confirmed_at && !existing.unsubscribed_at) {
      // Don't let anyone overwrite an active subscriber's preferences — email them a manage link instead.
      await sendEmail({ to: email, ...renderAlreadySubscribed(manageUrl(existing.token)) });
      await markConfirmationSent(existing.id);
      return ok;
    }

    const sub = await upsertPending(email, topics, frequency);
    const confirmUrl = `${siteUrl()}/confirm?token=${encodeURIComponent(sub.token)}`;
    await sendEmail({ to: email, ...renderConfirmation(confirmUrl, topics, frequency) });
    await markConfirmationSent(sub.id);
  } catch (err) {
    console.error("[subscribe] failed:", err);
    return Response.json({ error: "We couldn't send your confirmation email. Please try again shortly." }, { status: 502 });
  }
  return ok;
}
