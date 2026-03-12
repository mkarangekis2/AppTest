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

  return (
    <div className="shell-grid">
      <PageHeader
        eyebrow="Dashboard"
        title="ACG AI Operations Platform"
        description="Run onboarding, business analysis, and recommendation workflows. Install operations systems in controlled phases."
        badges={
          <>
            <span className="badge info">Operations command center</span>
            <span className="badge ghost">Platform overview</span>
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

      <section className="grid two">
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
        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">AI app workspace</div>
            <h2 style={{ margin: 0 }}>Operational AI apps for each team</h2>
          </div>
          <p className="muted">
            Build internal apps for proposal drafting, support response generation, planning support, and reporting workflows.
          </p>
          <div>
            <Link className="button secondary" href={"/apps" as Route}>
              Open AI Apps
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
