/** Shared UI primitives. Components compose these instead of re-declaring styles. */

type Variant = "primary" | "press" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-strong",
  /** The heavy ink bar used for "go to press" actions. */
  press: "press-button bg-ink text-paper hover:bg-accent",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-accent hover:bg-accent-soft",
  danger: "border border-danger text-danger hover:bg-danger hover:text-paper",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-6 py-5 font-display text-2xl tracking-wide",
};

/** Class names for anything that should look like a button (buttons, links). */
export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `kicker inline-flex items-center justify-center gap-2 rounded-control font-medium transition motion-safe:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
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
  return <section className={`rounded-card border border-line bg-surface ${className}`} {...props} />;
}

/** Small uppercase label above a group of content. */
export function Eyebrow({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`kicker text-xs font-medium text-muted ${className}`} {...props} />;
}

/**
 * Topic chip, styled as a block of metal type: it lifts off the page with an ink-offset shadow
 * on hover and presses flat when chosen. The emoji's own side bearing means the left padding
 * is optically trimmed so the label looks centered.
 */
export function chipClass(on: boolean) {
  return `type-block kicker border py-1.5 pl-2.5 pr-3 text-[12px] font-medium ${
    on ? "is-on border-ink bg-ink text-paper" : "border-ink/70 bg-surface text-ink disabled:cursor-not-allowed disabled:opacity-35"
  }`;
}

/** Input written on the page: just a baseline rule, which turns red while typing. */
export const inputClass =
  "min-w-0 flex-1 border-0 border-b-2 border-ink bg-transparent px-1 py-2 font-serif text-lg outline-none placeholder:text-muted/70 focus:border-accent";
