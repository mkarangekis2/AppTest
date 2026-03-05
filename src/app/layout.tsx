import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getOptionalUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "Injury Point",
  description: "An Augmentation Consulting Group Inc. training and evaluation platform for proctor-led casualty lanes."
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
                <span className="brand-mark">IP</span>
                <div className="eyebrow">Injury Point</div>
                <span className="badge info">Training-only scenario control</span>
              </div>
              <div className="brand-title">Proctor-led casualty lanes from CONOP through AAR</div>
              <div className="brand-copy">
                An Augmentation Consulting Group Inc. product for mission-aligned scenario generation, proctor-controlled
                lane execution, and standardized after-action evaluation.
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
