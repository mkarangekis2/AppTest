"use client";

import { useState } from "react";
import { PackageDefinition } from "@/lib/acg/types";

export function PackageMarketplace({ packages }: { packages: PackageDefinition[] }) {
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});

  async function installPackage(slug: string) {
    setPendingSlug(slug);
    setError(null);
    try {
      const response = await fetch("/api/packages/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Package install failed.");
      }
      setInstalled((prev) => ({ ...prev, [slug]: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Package install failed.");
    } finally {
      setPendingSlug(null);
    }
  }

  return (
    <div className="shell-grid">
      {error ? <div className="badge danger">{error}</div> : null}
      <section className="grid two">
        {packages.map((pkg) => (
          <article key={pkg.slug} className="card stack">
            <div className="badge-row">
              <span className="badge">{pkg.category}</span>
              {installed[pkg.slug] ? <span className="badge info">Installed</span> : null}
            </div>
            <h3 style={{ margin: 0 }}>{pkg.name}</h3>
            <p className="muted">{pkg.description}</p>
            {pkg.bestFit ? (
              <div className="packet-block">
                <div className="eyebrow">Best fit</div>
                <div>{pkg.bestFit}</div>
              </div>
            ) : null}
            {pkg.roiStory ? (
              <div className="packet-block">
                <div className="eyebrow">ROI story</div>
                <div>{pkg.roiStory}</div>
              </div>
            ) : null}
            <div className="packet-block">
              <div className="eyebrow">Included modules</div>
              <ul className="list-tight">
                {pkg.includedModuleSlugs.map((slug) => (
                  <li key={slug}>{slug}</li>
                ))}
              </ul>
            </div>
            <div className="muted">Setup estimate: {pkg.setupEstimate}</div>
            <div>
              <button
                disabled={Boolean(installed[pkg.slug]) || pendingSlug === pkg.slug}
                onClick={() => installPackage(pkg.slug)}
              >
                {pendingSlug === pkg.slug ? "Installing..." : installed[pkg.slug] ? "Installed" : "Install package"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
