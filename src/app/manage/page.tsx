import { connection } from "next/server";
import { Suspense } from "react";
import { ManageForm } from "@/components/ManageForm";
import { Notice } from "@/components/Notice";
import { findByToken } from "@/lib/subscribers";

async function Manage({ searchParams }: PageProps<"/manage">) {
  const { token } = await searchParams;
  await connection(); // database reads are request-time only
  const sub = await findByToken(typeof token === "string" ? token : "");
  if (!sub) {
    return (
      <Notice title="Link not found" tone="error">
        This link is invalid. Use the &ldquo;Change topics&rdquo; link from your most recent issue.
      </Notice>
    );
  }
  return (
    <ManageForm
      token={sub.token}
      email={sub.email}
      initialTopics={sub.topics}
      initialFrequency={sub.frequency}
      initiallyUnsubscribed={Boolean(sub.unsubscribed_at)}
    />
  );
}

export default function ManagePage(props: PageProps<"/manage">) {
  return (
    <Suspense fallback={<Notice title="Loading your preferences…" />}>
      <Manage {...props} />
    </Suspense>
  );
}
