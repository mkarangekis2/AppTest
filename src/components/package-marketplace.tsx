"use client";

import { useState } from "react";
import { PackageDefinition } from "@/lib/acg/types";
import { EmptyState, Notice } from "@/components/ui/feedback";

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
      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Package rollout</div>
          <h2 style={{ margin: 0 }}>Install pre-bundled systems by business objective</h2>
        </div>
        <div className="badge-row">
          <span className="badge info">{packages.length} launch packages</span>
          <span className="badge ghost">{Object.values(installed).filter(Boolean).length} installed this session</span>
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
      </section>

      <section className="grid two">
        {!packages.length ? <EmptyState title="No packages available" detail="Package catalog is currently empty." /> : null}
        {packages.map((pkg) => (
          <article key={pkg.slug} className="card stack">
            <div className="badge-row">
              <span className="badge">{pkg.category}</span>
              <span className="badge ghost">{pkg.setupEstimate}</span>
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
            <div className="grid two">
              <div className="packet-block">
                <div className="eyebrow">Implementation sequence</div>
                <ul className="list-tight">
                  <li>Install package modules in order</li>
                  <li>Connect required integrations</li>
                  <li>Activate default workflows</li>
                  <li>Review KPI impact after launch</li>
                </ul>
              </div>
              <div className="packet-block">
                <div className="eyebrow">Execution notes</div>
                <ul className="list-tight">
                  <li>Bundle designed for coordinated rollout</li>
                  <li>Use reports page for KPI validation</li>
                  <li>Adjust sequencing by team capacity</li>
                </ul>
              </div>
            </div>
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
