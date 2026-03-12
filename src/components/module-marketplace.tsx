"use client";

import { useMemo, useState } from "react";
import { ModuleDefinition } from "@/lib/acg/types";

export function ModuleMarketplace({ modules }: { modules: ModuleDefinition[] }) {
  const [query, setQuery] = useState("");
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter((item) =>
      [item.name, item.category, item.description, item.problemSolved].join(" ").toLowerCase().includes(q)
    );
  }, [modules, query]);

  async function installModule(slug: string) {
    setPendingSlug(slug);
    setError(null);
    try {
      const response = await fetch("/api/modules/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Install failed.");
      }
      setInstalled((prev) => ({ ...prev, [slug]: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Install failed.");
    } finally {
      setPendingSlug(null);
    }
  }

  return (
    <div className="shell-grid">
      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Search modules</div>
          <h2 style={{ margin: 0 }}>Marketplace catalog</h2>
        </div>
        <div className="field">
          <label htmlFor="module-search">Query</label>
          <input
            id="module-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by category, problem solved, or module name"
          />
        </div>
        {error ? <div className="badge danger">{error}</div> : null}
      </section>

      <section className="grid two">
        {filtered.map((moduleDef) => (
          <article key={moduleDef.slug} className="card stack">
            <div className="badge-row">
              <span className="badge">{moduleDef.category}</span>
              <span className="badge ghost">{moduleDef.complexity} complexity</span>
              {installed[moduleDef.slug] ? <span className="badge info">Installed</span> : null}
            </div>
            <h3 style={{ margin: 0 }}>{moduleDef.name}</h3>
            <p className="muted">{moduleDef.description}</p>
            <div className="packet-block">
              <div className="eyebrow">Problem solved</div>
              <div>{moduleDef.problemSolved}</div>
            </div>
            <div className="muted">Setup estimate: {moduleDef.setupEstimate}</div>
            <div>
              <button
                disabled={Boolean(installed[moduleDef.slug]) || pendingSlug === moduleDef.slug}
                onClick={() => installModule(moduleDef.slug)}
              >
                {pendingSlug === moduleDef.slug ? "Installing..." : installed[moduleDef.slug] ? "Installed" : "Install module"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
