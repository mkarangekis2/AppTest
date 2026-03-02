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
          <header className="header">
            <div className="stack">
              <div className="eyebrow">Ranger Medic Evaluator</div>
              <div>AI-assisted, proctor-controlled training scenarios</div>
            </div>
            <div className="stack" style={{ justifyItems: "end" }}>
              <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/">Dashboard</Link>
                <Link href="/conops/new">New CONOP</Link>
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
