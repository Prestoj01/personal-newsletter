/** Shared UI primitives. Components compose these instead of re-declaring styles. */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-white",
  ghost: "text-accent hover:bg-accent-soft",
  danger: "border border-danger text-danger hover:bg-danger hover:text-white",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

/** Class names for anything that should look like a button (buttons, links). */
export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={`rounded-card border border-line bg-surface shadow-sm ${className}`} {...props} />;
}

/** Small uppercase label above a group of content. */
export function Eyebrow({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-xs font-semibold uppercase tracking-widest text-muted ${className}`} {...props} />;
}

/** Selectable pill used for topics. */
export function chipClass(on: boolean) {
  return `rounded-full border px-3.5 py-1.5 text-sm transition ${
    on
      ? "border-accent bg-accent text-white shadow-sm"
      : "border-line-strong bg-surface text-ink/80 hover:border-muted disabled:cursor-not-allowed disabled:opacity-40"
  }`;
}

export const inputClass =
  "min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
