import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({ className, children, variant = "primary", disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" | "outline" | "danger" }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground shadow-sm hover:-translate-y-px hover:shadow-md",
        variant === "quiet" && "text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "outline" && "border border-border bg-card text-foreground hover:border-secondary hover:bg-secondary/10",
        variant === "danger" && "bg-destructive text-destructive-foreground hover:brightness-105",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/75 focus:border-secondary focus:ring-2 focus:ring-secondary/20", className)} {...props} />;
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "teal" | "coral" | "amber" | "navy"; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 font-mono-ui text-[10px] font-bold uppercase tracking-[0.08em]", tone === "neutral" && "bg-muted text-muted-foreground", tone === "teal" && "bg-secondary/20 text-[#147c6d]", tone === "coral" && "bg-accent/15 text-[#b74732]", tone === "amber" && "bg-[#f3e2b3] text-[#846119]", tone === "navy" && "bg-primary/10 text-primary", className)}>{children}</span>;
}

export function Panel({ children, className, ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-card-border bg-card shadow-sm", className)} {...props}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      {eyebrow && <div className="mb-2 font-mono-ui text-[10px] font-bold uppercase tracking-[0.15em] text-secondary">{eyebrow}</div>}
      <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
      {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
    </div>
    {action}
  </div>;
}

export function LoadingState({ label = "Loading research signals" }: { label?: string }) {
  return <div className="space-y-4" data-testid="status-loading">
    <div className="h-24 animate-pulse rounded-xl bg-muted" />
    <div className="grid gap-4 md:grid-cols-3"><div className="h-32 animate-pulse rounded-xl bg-muted" /><div className="h-32 animate-pulse rounded-xl bg-muted" /><div className="h-32 animate-pulse rounded-xl bg-muted" /></div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> {label}</div>
  </div>;
}

export function ErrorState({ onRetry, detail = "The research room could not be reached." }: { onRetry: () => void; detail?: string }) {
  return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center" data-testid="status-error">
    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">!</div>
    <h3 className="font-display text-xl font-semibold">A signal dropped</h3>
    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{detail}</p>
    <Button type="button" variant="outline" onClick={onRetry} className="mt-5">Try again</Button>
  </div>;
}

export function EmptyState({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action?: ReactNode }) {
  return <div className="paper-grid rounded-xl border border-dashed border-border bg-background/60 px-6 py-14 text-center" data-testid="status-empty">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">{icon}</div>
    <h3 className="font-display text-xl font-semibold">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{detail}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>;
}
