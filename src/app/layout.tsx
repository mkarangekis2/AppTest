import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import "./globals.css";
import { getOptionalUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "ACG AI Operations Platform",
  description: "An Augmentation Consulting Group Inc. product for AI-guided SMB operations analysis, recommendations, and modular systems."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getOptionalUser();

  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <div className="brand-block">
              <div className="brand-kicker">
                <span className="brand-mark">ACG</span>
                <div className="eyebrow">ACG AI Operations Platform</div>
                <span className="badge info">Augmentation Consulting Group Inc.</span>
              </div>
              <div className="brand-title">Install operational systems that run your business better</div>
              <div className="brand-copy">
                Diagnose operational bottlenecks, receive explainable recommendations, and activate modular systems with
                workflow visibility.
              </div>
            </div>
            <div className="stack tight" style={{ justifyItems: "end" }}>
              <nav className="topnav">
                <Link className="nav-link" href={"/" as Route}>
                  Home
                </Link>
                <Link className="nav-link" href={"/dashboard" as Route}>
                  Dashboard
                </Link>
                <Link className="nav-link" href={"/onboarding" as Route}>
                  Onboarding
                </Link>
                <Link className="nav-link" href={"/analysis" as Route}>
                  Analysis
                </Link>
                <Link className="nav-link" href={"/recommendations" as Route}>
                  Recommendations
                </Link>
                <Link className="nav-link" href={"/modules" as Route}>
                  Modules
                </Link>
                <Link className="nav-link" href={"/packages" as Route}>
                  Packages
                </Link>
                <Link className="nav-link" href={"/industry-packs" as Route}>
                  Industry Packs
                </Link>
                <Link className="nav-link" href={"/workflows" as Route}>
                  Workflows
                </Link>
                <Link className="nav-link" href={"/activity" as Route}>
                  Activity
                </Link>
                <Link className="nav-link" href={"/knowledge" as Route}>
                  Knowledge
                </Link>
                <Link className="nav-link" href={"/customers" as Route}>
                  Customers
                </Link>
                <Link className="nav-link" href={"/reports" as Route}>
                  Reports
                </Link>
                <Link className="nav-link" href={"/integrations" as Route}>
                  Integrations
                </Link>
                <Link className="nav-link" href={"/settings" as Route}>
                  Settings
                </Link>
                <Link className="nav-link" href={"/legacy" as Route}>
                  Legacy
                </Link>
              </nav>
              {user ? <SignOutButton /> : <Link href="/login">Sign in</Link>}
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
