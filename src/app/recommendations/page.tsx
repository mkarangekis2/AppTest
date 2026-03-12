import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { generateRecommendations } from "@/services/recommendation-engine/engine";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export default async function RecommendationsPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card stack">
          <EmptyState
            title="No onboarding profile found"
            detail="Complete onboarding first to generate recommendation sets."
            action={
              <Link className="button" href={"/onboarding" as Route}>
                Start onboarding
              </Link>
            }
          />
        </section>
      </div>
    );
  }

  const items = generateRecommendations(context.payload);

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Recommendations"
        title={`Recommended systems for ${context.company.name}`}
        description="Actionable install sequence generated from your onboarding profile and operating constraints."
        badges={
          <>
            <span className="badge info">Recommendation engine</span>
            <span className="badge ghost">Config-driven and explainable</span>
            <span className="badge">{items.length} recommendations</span>
          </>
        }
      />

      {items.length ? (
        <section className="grid two">
          {items.map((item, index) => (
            <article key={`${item.recommendationType}:${item.slug}`} className="card stack">
              <div className="badge-row">
                <span className="badge info">Priority {index + 1}</span>
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
              {item.requiredIntegrations.length ? (
                <div className="muted">Integrations: {item.requiredIntegrations.join(", ")}</div>
              ) : null}
              {Array.isArray(item.evidence.includedModules) ? (
                <div className="packet-block">
                  <div className="eyebrow">Included modules</div>
                  <ul className="list-tight">
                    {(item.evidence.includedModules as string[]).map((moduleSlug) => (
                      <li key={moduleSlug}>{moduleSlug}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <section className="card">
          <EmptyState title="No recommendations generated yet" detail="Update onboarding answers and retry analysis." />
        </section>
      )}
    </div>
  );
}
