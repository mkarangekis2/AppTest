"use client";

import { useMemo, useState } from "react";
import { ModuleDefinition } from "@/lib/acg/types";
import { EmptyState, Notice } from "@/components/ui/feedback";

export function ModuleMarketplace({ modules }: { modules: ModuleDefinition[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});
  const categories = useMemo(() => ["all", ...Array.from(new Set(modules.map((module) => module.category)))], [modules]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery = q
        ? [item.name, item.category, item.description, item.problemSolved].join(" ").toLowerCase().includes(q)
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [modules, query, category]);

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
          <div className="eyebrow">Search and filter</div>
          <h2 style={{ margin: 0 }}>Marketplace catalog</h2>
        </div>
        <div className="grid two">
          <div className="field">
            <label htmlFor="module-search">Query</label>
            <input
              id="module-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by category, problem solved, or module name"
            />
          </div>
          <div className="field">
            <label htmlFor="module-category">Category</label>
            <select id="module-category" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value === "all" ? "All categories" : value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="badge-row">
          <span className="badge info">{filtered.length} matching modules</span>
          <span className="badge ghost">{Object.values(installed).filter(Boolean).length} installed this session</span>
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
      </section>

      <section className="grid two">
        {!filtered.length ? <EmptyState title="No modules match this query" detail="Try a broader keyword or clear the filter." /> : null}
        {filtered.map((moduleDef) => (
          <article key={moduleDef.slug} className="card stack">
            <div className="badge-row">
              <span className="badge">{moduleDef.category}</span>
              <span className={`badge ${moduleDef.complexity === "high" ? "warning" : "ghost"}`}>{moduleDef.complexity} complexity</span>
              {installed[moduleDef.slug] ? <span className="badge info">Installed</span> : null}
            </div>
            <h3 style={{ margin: 0 }}>{moduleDef.name}</h3>
            <p className="muted">{moduleDef.description}</p>
            <div className="packet-block">
              <div className="eyebrow">Problem solved</div>
              <div>{moduleDef.problemSolved}</div>
            </div>
            <div className="grid two">
              <div className="packet-block">
                <div className="eyebrow">Expected outcomes</div>
                <ul className="list-tight">
                  {moduleDef.expectedOutcomes.slice(0, 3).map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>
              <div className="packet-block">
                <div className="eyebrow">Install details</div>
                <div className="muted">Setup estimate: {moduleDef.setupEstimate}</div>
                {moduleDef.requiredIntegrations.length ? (
                  <div className="muted">Integrations: {moduleDef.requiredIntegrations.join(", ")}</div>
                ) : (
                  <div className="muted">No required integrations</div>
                )}
              </div>
            </div>
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
