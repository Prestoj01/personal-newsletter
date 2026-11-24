import type { Metadata } from "next";
import { Suspense } from "react";
import { EditionSkeleton } from "@/components/Edition";
import { PageTurn } from "@/components/PageTurn";
import { ReadPage } from "@/components/ReadPage";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = { title: `Your edition · ${APP_NAME}` };

export default function Page() {
  return (
    <PageTurn>
      {/* Search params (shared papers) are only known in the browser of a static site. */}
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-6 py-6 lg:pr-[312px]">
            <EditionSkeleton />
          </div>
        }
      >
        <ReadPage />
      </Suspense>
    </PageTurn>
  );
}
