import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { generateBusinessAnalysis } from "@/services/business-analysis/engine";

export default async function AnalysisPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);

  if (!context) {
    return (
      <div className="shell-grid">
        <section className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Business analysis</div>
            <h1 style={{ margin: 0 }}>No onboarding profile found</h1>
          </div>
          <p className="muted">Complete onboarding first to generate your initial operations analysis.</p>
          <div>
            <Link className="button" href={"/onboarding" as Route}>
              Start onboarding
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const analysis = generateBusinessAnalysis(context.payload);

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Business analysis report</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Analysis</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            {context.company.name}
          </h1>
        </div>
        <p className="lede">{analysis.summary}</p>
      </section>

      <section className="metric-grid">
        <Metric label="Lead handling" value={analysis.scores.leadHandling} />
        <Metric label="Documentation" value={analysis.scores.documentation} />
        <Metric label="Service delivery" value={analysis.scores.serviceDelivery} />
        <Metric label="Automation potential" value={analysis.scores.automationPotential} />
        <Metric label="Revenue leakage risk" value={analysis.scores.revenueLeakageRisk} />
        <Metric label="Executive visibility" value={analysis.scores.executiveVisibility} />
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
