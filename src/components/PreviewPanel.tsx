"use client";

interface Props {
  html: string | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  canPreview: boolean;
}

export function PreviewPanel({ html, loading, error, onRefresh, canPreview }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="ml-3 text-xs font-medium text-stone-500">Live preview</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={!canPreview || loading}
          className="rounded-full px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-40"
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>
      <div className="relative h-[640px] bg-[#faf7f2]">
        {html && <iframe title="Newsletter preview" srcDoc={html.replace("<head>", "<head><base target=\"_blank\">")} sandbox="allow-popups allow-popups-to-escape-sandbox" className={`h-full w-full transition-opacity ${loading ? "opacity-40" : ""}`} />}
        {!html && (
          <div className="flex h-full flex-col items-center justify-center px-10 text-center text-stone-500">
            {loading ? (
              <p className="animate-pulse">Gathering today&apos;s headlines…</p>
            ) : error ? (
              <p className="text-red-700">{error}</p>
            ) : (
              <>
                <p className="font-serif text-2xl text-stone-800">Your newsletter, before you subscribe.</p>
                <p className="mt-2 text-sm">Pick a few topics and a real preview with the latest headlines will appear here.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
