import { connection } from "next/server";
import { Suspense } from "react";
import { Notice } from "@/components/Notice";
import { deliverIssue, manageUrl } from "@/lib/delivery";
import { frequencyInfo, nextSendAt } from "@/lib/frequency";
import { confirm, findByToken, recordSent } from "@/lib/subscribers";

export const maxDuration = 30;

async function Confirm({ searchParams }: PageProps<"/confirm">) {
  const { token } = await searchParams;
  await connection(); // database reads are request-time only
  const sub = await findByToken(typeof token === "string" ? token : "");
  if (!sub) {
    return (
      <Notice title="Link not found" tone="error">
        This confirmation link is invalid or has already been replaced by a newer one. Try subscribing again.
      </Notice>
    );
  }

  const confirmed = await confirm(sub.id);
  const alreadyActive = !confirmed;
  let firstIssueSent = false;
  if (confirmed) {
    try {
      firstIssueSent = await deliverIssue(confirmed);
    } catch (err) {
      console.error("[confirm] first issue failed:", err);
    }
    await recordSent(confirmed.id, confirmed.frequency);
  }

  const freq = frequencyInfo(sub.frequency).label.toLowerCase();
  const next = nextSendAt(sub.frequency).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

  return (
    <Notice title={alreadyActive ? "You're already subscribed" : "You're subscribed! 🎉"}>
      <p>
        {firstIssueSent ? "Your first issue is on its way to " : "Your newsletter will be delivered to "}
        <strong>{sub.email}</strong>. After that, you&apos;ll get a {freq} issue
        {alreadyActive ? "" : <> — next one around <strong>{next}</strong></>}.
      </p>
      <p className="mt-4">
        <a href={manageUrl(sub.token)} className="text-orange-700 underline">
          Change topics or frequency
        </a>
      </p>
    </Notice>
  );
}

export default function ConfirmPage(props: PageProps<"/confirm">) {
  return (
    <Suspense fallback={<Notice title="Confirming…">Hang tight while we set up your newsletter.</Notice>}>
      <Confirm {...props} />
    </Suspense>
  );
}
