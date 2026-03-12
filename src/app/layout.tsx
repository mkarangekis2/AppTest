import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getOptionalUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { AppNavigation } from "@/components/app-navigation";
import { CommandPalette } from "@/components/ui/command-palette";
import { AppBreadcrumbs } from "@/components/ui/breadcrumbs";

const headingFont = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"]
});

const uiFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "ACG AI Operations Platform",
  description: "An Augmentation Consulting Group Inc. product for AI-guided SMB operations analysis, recommendations, and modular systems."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getOptionalUser();
  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/analysis", label: "Analysis" },
    { href: "/recommendations", label: "Recommendations" },
    { href: "/apps", label: "AI Apps" },
    { href: "/modules", label: "Modules" },
    { href: "/packages", label: "Packages" },
    { href: "/industry-packs", label: "Industry Packs" },
    { href: "/workflows", label: "Workflows" },
    { href: "/activity", label: "Activity" },
    { href: "/knowledge", label: "Knowledge" },
    { href: "/customers", label: "Customers" },
    { href: "/reports", label: "Reports" },
    { href: "/integrations", label: "Integrations" },
    { href: "/settings", label: "Settings" }
  ] as const;
  const quickItems = [
    { href: "/dashboard", label: "Dashboard", hint: "Overview and KPI command center" },
    { href: "/onboarding", label: "Onboarding", hint: "Run business diagnostic" },
    { href: "/analysis", label: "Analysis", hint: "Review operational analysis" },
    { href: "/recommendations", label: "Recommendations", hint: "See install recommendations" },
    { href: "/apps", label: "AI Apps", hint: "Build and run internal AI apps" },
    { href: "/workflows", label: "Workflows", hint: "Manage automations" },
    { href: "/activity", label: "Activity", hint: "Inspect execution timeline" },
    { href: "/knowledge", label: "Knowledge", hint: "Search indexed docs" },
    { href: "/customers", label: "Customers", hint: "View leads, clients, opportunities" },
    { href: "/settings", label: "Settings", hint: "Company and AI configuration" }
  ] as const;

  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${uiFont.variable}`}>
        <div className="app-shell">
          <aside className="app-sidebar">
            <Link href={"/" as Route} className="sidebar-brand">
              <span className="brand-mark">ACG</span>
              <div className="brand-meta">
                <span className="brand-company">Augmentation Consulting Group Inc.</span>
                <strong className="brand-product">AI Operations Platform</strong>
              </div>
            </Link>
            <AppNavigation items={nav} />
            <div className="sidebar-footer">
              <span className="badge info">Production-ready</span>
              <span className="badge ghost">AI-guided operations</span>
            </div>
          </aside>
          <main className="app-main">
            <header className="topbar">
              <div className="topbar-title">
                <div className="topbar-kicker">ACG Operations OS</div>
                <div className="topbar-heading">Command layer for AI-guided business execution</div>
                <div className="topbar-copy">
                  Analyze operations, install systems, run workflows, and ship AI apps in one workspace.
                </div>
              </div>
              <div className="stack tight topbar-actions" style={{ justifyItems: "end" }}>
                <nav className="topnav">
                  <Link className="nav-link" href={"/" as Route}>
                    Home
                  </Link>
                  <Link className="nav-link" href={"/apps" as Route}>
                    AI Apps
                  </Link>
                </nav>
                <div className="command-row">
                  <CommandPalette items={quickItems} />
                  {user ? <SignOutButton /> : <Link className="button secondary compact" href="/login">Sign in</Link>}
                </div>
              </div>
            </header>
            <div className="context-bar">
              <AppBreadcrumbs />
            </div>
            <div className="shell">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
