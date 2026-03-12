import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { getOptionalUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

const headlineFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["400", "600", "700"]
});

const uiFont = Manrope({
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

  return (
    <html lang="en">
      <body className={`${headlineFont.variable} ${uiFont.variable}`}>
        <div className="app-shell">
          <aside className="app-sidebar">
            <Link href={"/" as Route} className="sidebar-brand">
              <span className="brand-mark">ACG</span>
              <div className="stack tight">
                <div className="eyebrow">Augmentation Consulting Group Inc.</div>
                <strong>AI Operations Platform</strong>
              </div>
            </Link>
            <nav className="sidebar-nav">
              {nav.map((item) => (
                <Link key={item.href} className="sidebar-link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="sidebar-footer">
              <span className="badge info">Production-ready</span>
              <span className="badge ghost">AI-guided operations</span>
            </div>
          </aside>
          <main className="app-main">
            <header className="topbar">
              <div className="brand-block">
                <div className="brand-kicker">
                  <span className="badge info">ACG Platform</span>
                  <span className="badge">Install systems, run better operations</span>
                </div>
                <div className="brand-title">Build and operate AI-powered business systems</div>
                <div className="brand-copy">
                  Onboard your operating model, generate explainable recommendations, install modules, and run AI apps with
                  full operational visibility.
                </div>
              </div>
              <div className="stack tight" style={{ justifyItems: "end" }}>
                <nav className="topnav">
                  <Link className="nav-link" href={"/" as Route}>
                    Home
                  </Link>
                  <Link className="nav-link" href={"/apps" as Route}>
                    AI Apps
                  </Link>
                </nav>
                {user ? <SignOutButton /> : <Link href="/login">Sign in</Link>}
              </div>
            </header>
            <div className="shell">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
