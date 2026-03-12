import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { generateRecommendations } from "@/services/recommendation-engine/engine";

export default async function RecommendationsPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Recommendations</div>
            <h1 style={{ margin: 0 }}>No onboarding profile found</h1>
          </div>
          <p className="muted">Complete onboarding first to generate recommendation sets.</p>
          <div>
            <Link className="button" href={"/onboarding" as Route}>
              Start onboarding
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const items = generateRecommendations(context.payload);

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Recommendation engine</span>
          <span className="badge ghost">Config-driven and explainable</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Recommendations</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Recommended systems for {context.company.name}
          </h1>
        </div>
      </section>

      {items.length ? (
        <section className="grid two">
          {items.map((item) => (
            <article key={`${item.recommendationType}:${item.slug}`} className="card stack">
              <div className="badge-row">
                <span className="badge">{item.recommendationType}</span>
                <span className={`badge ${item.expectedImpact === "high" ? "warning" : ""}`}>{item.expectedImpact} impact</span>
                <span className="badge ghost">{item.implementationComplexity} complexity</span>
              </div>
              <h2 style={{ margin: 0 }}>{item.title}</h2>
              <p className="muted">{item.problemSolved}</p>
              <div className="packet-block">
                <div className="eyebrow">Why recommended</div>
                <div>{item.reason}</div>
              </div>
              <div className="muted">Setup estimate: {item.setupEstimate}</div>
            </article>
          ))}
        </section>
      ) : (
        <section className="card">
          <div className="empty-state">No recommendations generated yet. Update onboarding answers and retry analysis.</div>
        </section>
      )}
    </div>
  );
}
