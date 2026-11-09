import { buildSections } from "@/lib/news";
import { renderNewsletter } from "@/lib/templates";
import { badRequest, normalizeFrequency, normalizeTopics } from "@/lib/validation";

export const maxDuration = 30;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const topics = normalizeTopics(body?.topics);
  const frequency = normalizeFrequency(body?.frequency);
  if (!topics) return badRequest("Pick at least one topic.");
  if (!frequency) return badRequest("Pick a frequency.");

  const sections = await buildSections(topics, frequency);
  const { html, subject, total } = renderNewsletter({ sections, frequency });
  return Response.json({ html, subject, total });
}
