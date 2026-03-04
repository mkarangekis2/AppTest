import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getOptionalUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "Ranger Medic Evaluator",
  description: "Training scenario workflow for proctor-led Ranger medic evaluation."
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
                <span className="brand-mark">RM</span>
                <div className="eyebrow">Ranger Medic Evaluator</div>
                <span className="badge info">Training-only scenario control</span>
              </div>
              <div className="brand-title">Proctor-led casualty lanes from CONOP through AAR</div>
              <div className="brand-copy">
                Build mission-aligned scenarios, keep AI guidance under instructor control, and run standardized live
                evaluations without losing realism.
              </div>
            </div>
            <div className="stack tight" style={{ justifyItems: "end" }}>
              <nav className="topnav">
                <Link className="nav-link" href="/">
                  Dashboard
                </Link>
                <Link className="nav-link" href="/conops/new">
                  New CONOP
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
