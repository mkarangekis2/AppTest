import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { generateBusinessAnalysis } from "@/services/business-analysis/engine";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

export default async function AnalysisPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card stack">
          <EmptyState
            title="No onboarding profile found"
            detail="Complete onboarding first to generate your initial operations analysis."
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

  const analysis = generateBusinessAnalysis(context.payload);

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Analysis"
        title={context.company.name}
        description={analysis.summary}
        badges={
          <>
            <span className="badge info">Business analysis report</span>
            <span className="badge ghost">Explainable score model</span>
          </>
        }
      />

      <section className="metric-grid">
        <Metric label="Lead handling" value={analysis.scores.leadHandling} />
        <Metric label="Documentation" value={analysis.scores.documentation} />
        <Metric label="Service delivery" value={analysis.scores.serviceDelivery} />
        <Metric label="Automation potential" value={analysis.scores.automationPotential} />
        <Metric label="Revenue leakage risk" value={analysis.scores.revenueLeakageRisk} />
        <Metric label="Executive visibility" value={analysis.scores.executiveVisibility} />
      </section>

      <section className="grid three">
        <article className="card stack">
          <div className="eyebrow">Prioritized pain points</div>
          <ul className="list-tight">
            {analysis.prioritizedPainPoints.length ? (
              analysis.prioritizedPainPoints.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>No major pain points identified.</li>
            )}
          </ul>
        </article>
        <article className="card stack">
          <div className="eyebrow">Primary recommendation vector</div>
          <div className="muted">
            Focus on modules that improve handoffs, speed response cycles, and reduce manual routing overhead.
          </div>
        </article>
        <article className="card stack card-dark">
          <div className="eyebrow">Readout note</div>
          <div className="muted">
            Scores represent comparative operating maturity from your onboarding data and should be reviewed before install sequencing.
          </div>
        </article>
      </section>

      <section className="grid two">
        <div className="card stack">
          <div className="eyebrow">Risk areas</div>
          <ul className="list-tight">
            {analysis.riskAreas.length ? analysis.riskAreas.map((item) => <li key={item}>{item}</li>) : <li>No critical risk areas flagged.</li>}
          </ul>
        </div>
        <div className="card stack">
          <div className="eyebrow">Opportunity areas</div>
          <ul className="list-tight">
            {analysis.opportunities.length ? analysis.opportunities.map((item) => <li key={item}>{item}</li>) : <li>No immediate opportunities identified.</li>}
          </ul>
        </div>
      </section>

      <div className="action-row">
        <Link className="button" href={"/recommendations" as Route}>
          View recommendations
        </Link>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="muted">Score out of 100</div>
    </div>
  );
}
