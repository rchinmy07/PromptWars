import { type ReactNode, useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Redirect, Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";
import Landing from "@/pages/landing";
import Workspace from "@/pages/workspace";
import SearchPage from "@/pages/search";
import GraphPage from "@/pages/graph";
import DocumentsPage from "@/pages/documents";
import IngestPage from "@/pages/ingest";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

const clerkAppearance = {
  theme: "simple" as const,
  options: { logoPlacement: "inside" as const, logoLinkUrl: basePath || "/", logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
  variables: {
    colorPrimary: "#173345", colorForeground: "#173345", colorMutedForeground: "#69757b", colorDanger: "#c94c3e",
    colorBackground: "#f9f7f0", colorInput: "#fffefa", colorInputForeground: "#173345", colorNeutral: "#d4d9d3",
    fontFamily: "DM Sans", borderRadius: "0.8rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#f9f7f0] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-[#d4d9d3]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-semibold text-[#173345]", headerSubtitle: "text-[#69757b]",
    socialButtonsBlockButtonText: "text-[#173345]", formFieldLabel: "text-[#173345]",
    footerActionLink: "text-[#147c6d]", footerActionText: "text-[#69757b]", dividerText: "text-[#69757b]",
    alertText: "text-[#c94c3e]", logoBox: "h-10", logoImage: "h-9",
    socialButtonsBlockButton: "border-[#d4d9d3] bg-[#fffefa]", formButtonPrimary: "bg-[#173345] text-[#f9f7f0] hover:bg-[#214b62]",
    formFieldInput: "border-[#d4d9d3] bg-[#fffefa] text-[#173345]", footerAction: "bg-transparent",
    dividerLine: "bg-[#d4d9d3]", alert: "bg-[#fbe8e3] border-[#e9a89b]", otpCodeFieldInput: "border-[#d4d9d3] bg-[#fffefa]",
    formFieldRow: "text-[#173345]", main: "bg-transparent",
  },
};

function SignInPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}
function SignUpPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
}
function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => { const next = user?.id ?? null; if (previous.current !== undefined && previous.current !== next) client.clear(); previous.current = next; }), [addListener, client]);
  return null;
}
function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-background" />;
  return isSignedIn ? <Redirect to="/workspace" /> : <Landing />;
}
function Protected({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-background" />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <AppShell>{children}</AppShell>;
}
function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/" component={HomeRedirect} />
    <Route path="/sign-in/*?" component={SignInPage} />
    <Route path="/sign-up/*?" component={SignUpPage} />
    <Route path="/workspace"><Protected><Workspace /></Protected></Route>
    <Route path="/search"><Protected><SearchPage /></Protected></Route>
    <Route path="/graph"><Protected><GraphPage /></Protected></Route>
    <Route path="/documents"><Protected><DocumentsPage /></Protected></Route>
    <Route path="/ingest"><Protected><IngestPage /></Protected></Route>
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}
function ClerkApp() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} localization={{ signIn: { start: { title: "Welcome back", subtitle: "Return to your research room" } }, signUp: { start: { title: "Create your research room", subtitle: "Connect the work your team already has" } } }} routerPush={(to: string) => setLocation(stripBase(to))} routerReplace={(to: string) => setLocation(stripBase(to), { replace: true })}><QueryClientProvider client={queryClient}><TooltipProvider><ClerkCacheInvalidator /><Router /><Toaster /></TooltipProvider></QueryClientProvider></ClerkProvider>;
}
function App() {
  return <WouterRouter base={basePath}><ClerkApp /></WouterRouter>;
}
export default App;
