import { findByToken, resubscribe, updatePreferences } from "@/lib/subscribers";
import { badRequest, normalizeFrequency, normalizeTopics } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const sub = await findByToken(typeof body?.token === "string" ? body.token : "");
  if (!sub) return Response.json({ error: "This link is invalid or has expired." }, { status: 404 });

  const topics = normalizeTopics(body?.topics);
  const frequency = normalizeFrequency(body?.frequency);
  if (!topics) return badRequest("Pick at least one topic.");
  if (!frequency) return badRequest("Pick a frequency.");

  const updated = await updatePreferences(sub.id, topics, frequency);
  if (updated.unsubscribed_at && body?.resubscribe) await resubscribe(sub.id, frequency);
  return Response.json({ ok: true });
}
