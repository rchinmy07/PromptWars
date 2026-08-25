import { useState, type ReactNode } from "react";
import { useClerk, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { BookOpen, ChevronDown, Home, LogOut, Menu, Network, Search, ShieldCheck, UploadCloud, X } from "lucide-react";

const navItems = [
  { href: "/workspace", label: "Workspace", icon: Home },
  { href: "/search", label: "Search intelligence", icon: Search },
  { href: "/graph", label: "Knowledge graph", icon: Network },
  { href: "/documents", label: "Document library", icon: BookOpen },
  { href: "/ingest", label: "Ingest sources", icon: UploadCloud },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const initials = user?.firstName?.slice(0, 1) || user?.emailAddresses?.[0]?.emailAddress?.slice(0, 1).toUpperCase() || "R";
  return <div className="min-h-[100dvh] bg-background">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[254px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-200 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between px-3">
        <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary"><span className="absolute h-4 w-4 rounded-full border-2 border-primary" /><span className="absolute h-1.5 w-1.5 rounded-full bg-primary" /></span>
          <span><span className="block font-display text-lg font-semibold tracking-[-0.04em]">Research Graph</span><span className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-sidebar-foreground/50">Private intelligence room</span></span>
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="text-sidebar-foreground/60 md:hidden" data-testid="button-close-menu"><X className="h-5 w-5" /></button>
      </div>
      <div className="mt-10 px-3 font-mono-ui text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40">Navigate</div>
      <nav className="mt-3 space-y-1" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} data-testid={`link-nav-${href.slice(1)}`} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${location === href ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"}`}>
          <Icon className={`h-4 w-4 ${location === href ? "text-sidebar-primary" : ""}`} /><span>{label}</span>{location === href && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
        </Link>)}
      </nav>
      <div className="mt-auto">
        <div className="mb-4 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="h-3.5 w-3.5 text-sidebar-primary" /> Private workspace</div>
          <p className="mt-2 text-[11px] leading-5 text-sidebar-foreground/50">Your sources stay scoped to this research room.</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-sidebar-foreground/10"><div className="h-full w-[92%] rounded-full bg-sidebar-primary" /></div>
          <div className="mt-1.5 flex justify-between font-mono-ui text-[9px] uppercase tracking-wider text-sidebar-foreground/40"><span>Storage encrypted</span><span>92%</span></div>
        </div>
        <button type="button" onClick={() => signOut({ redirectUrl: "/" })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground" data-testid="button-sign-out"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </aside>
    {open && <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-primary/30 md:hidden" data-testid="button-overlay" />}
    <div className="md:pl-[254px]">
      <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3"><button type="button" onClick={() => setOpen(true)} className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden" data-testid="button-open-menu"><Menu className="h-5 w-5" /></button><div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Live research room</div></div>
        <div className="flex items-center gap-4"><Link href="/search" className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-secondary sm:flex" data-testid="link-global-search"><Search className="h-3.5 w-3.5" /> Search the graph <span className="font-mono-ui text-[10px] text-muted-foreground/60">⌘ K</span></Link><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary" data-testid="avatar-user">{initials}</div><div className="hidden leading-tight lg:block"><div className="text-xs font-semibold">{user?.firstName || "Researcher"}</div><div className="text-[10px] text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || "Private account"}</div></div><ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /></div></div>
      </header>
      <main className="mx-auto max-w-[1480px] px-5 py-8 md:px-9 md:py-10">{children}</main>
    </div>
  </div>;
}
