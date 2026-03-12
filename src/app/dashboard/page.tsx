import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { generateBusinessAnalysis } from "@/services/business-analysis/engine";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);
  const analysis = context ? generateBusinessAnalysis(context.payload) : null;
  const stage = context ? "Workspace active" : "Workspace not initialized";

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Dashboard"
        title="Operational command center"
        description="Track platform readiness, run diagnostic-to-install flows, and launch execution workflows with full visibility."
        badges={
          <>
            <span className="badge info">Operations command center</span>
            <span className="badge ghost">Platform overview</span>
            <span className={`badge ${context ? "success" : "warning"}`}>{stage}</span>
          </>
        }
        actions={
          <>
            <Link className="button" href={"/onboarding" as Route}>
              Start onboarding
            </Link>
            <Link className="button secondary" href={"/recommendations" as Route}>
              View recommendations
            </Link>
          </>
        }
      />

      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Company profile</div>
          <div className="metric-value">{context?.company.name || "Not configured"}</div>
          <div className="muted">{context ? context.company.industry : "Run onboarding to initialize your profile."}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Lead handling score</div>
          <div className="metric-value">{analysis?.scores.leadHandling ?? "-"}</div>
          <div className="muted">Updated from latest onboarding profile.</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Automation potential</div>
          <div className="metric-value">{analysis?.scores.automationPotential ?? "-"}</div>
          <div className="muted">Higher means stronger ROI from module installs.</div>
        </div>
      </section>

      <section className="split">
        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Readiness snapshot</div>
            <h2 style={{ margin: 0 }}>Current operational posture</h2>
          </div>
          <div className="timeline-list">
            <div className="timeline-item">
              <div className="badge-row">
                <span className={`badge ${context ? "success" : "warning"}`}>{context ? "Configured" : "Pending"}</span>
                <span className="badge ghost">Onboarding profile</span>
              </div>
              <div className="muted">
                {context
                  ? `${context.company.name} profile available with industry context and maturity inputs.`
                  : "Initialize your workspace profile to unlock analysis and recommendation outputs."}
              </div>
            </div>
            <div className="timeline-item">
              <div className="badge-row">
                <span className={`badge ${analysis ? "success" : "warning"}`}>{analysis ? "Ready" : "Pending"}</span>
                <span className="badge ghost">Business analysis</span>
              </div>
              <div className="muted">
                {analysis
                  ? "Analysis scores are available. Proceed to recommendations and installs."
                  : "Analysis is generated immediately after onboarding completes."}
              </div>
            </div>
            <div className="timeline-item">
              <div className="badge-row">
                <span className="badge info">Next step</span>
                <span className="badge ghost">Action queue</span>
              </div>
              <div className="muted">
                Start with onboarding, then deploy the first module/package set with the highest expected impact.
              </div>
            </div>
          </div>
        </div>

        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Platform flow</div>
            <h2 style={{ margin: 0 }}>Core operating loop</h2>
          </div>
          <ol className="list-tight">
            <li>Onboarding diagnostic</li>
            <li>Business analysis</li>
            <li>Recommendation output</li>
            <li>Module and package installation</li>
            <li>Workflow activation and visibility</li>
          </ol>
        </div>
      </section>

      <section className="grid three">
        <Link className="card-link" href={"/apps" as Route}>
          <div className="eyebrow">AI app workspace</div>
          <strong>Build operational AI apps</strong>
          <span className="muted">Create reusable prompt-driven apps for support, planning, and reporting workflows.</span>
        </Link>
        <Link className="card-link" href={"/workflows" as Route}>
          <div className="eyebrow">Workflow engine</div>
          <strong>Automate execution paths</strong>
          <span className="muted">Model trigger-condition-action logic and run it in a controlled execution lane.</span>
        </Link>
        <Link className="card-link" href={"/reports" as Route}>
          <div className="eyebrow">Executive visibility</div>
          <strong>Track business outcomes</strong>
          <span className="muted">Monitor pipeline, churn, and workflow reliability through KPI dashboards.</span>
        </Link>
      </section>
    </div>
  );
}
