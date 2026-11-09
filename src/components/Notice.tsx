import Link from "next/link";

export function Notice({ title, children, tone = "default" }: { title: string; children?: React.ReactNode; tone?: "default" | "error" }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className={`font-serif text-4xl ${tone === "error" ? "text-red-800" : "text-stone-900"}`}>{title}</h1>
      <div className="mt-4 text-stone-600">{children}</div>
      <Link href="/" className="mt-8 inline-block rounded-full border border-stone-800 px-5 py-2 text-sm font-medium hover:bg-stone-800 hover:text-white">
        Back to home
      </Link>
    </div>
  );
}
