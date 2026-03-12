import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { generateBusinessAnalysis } from "@/services/business-analysis/engine";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const context = await getLatestCompanyContext(supabase, user.id);
  const analysis = context ? generateBusinessAnalysis(context.payload) : null;

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Operations command center</span>
          <span className="badge ghost">Phase 1 foundation</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Dashboard</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            ACG AI Operations Platform
          </h1>
        </div>
        <p className="lede">
          Run onboarding, business analysis, and recommendation workflows. Install operations systems in controlled phases.
        </p>
        <div className="hero-actions">
          <Link className="button" href={"/onboarding" as Route}>
            Start onboarding
          </Link>
          <Link className="button secondary" href={"/recommendations" as Route}>
            View recommendations
          </Link>
        </div>
      </section>

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
            <div className="eyebrow">Legacy access</div>
            <h2 style={{ margin: 0 }}>Training platform retained</h2>
          </div>
          <p className="muted">
            Existing Ranger Medic evaluator workflows remain available while the ACG platform is rolled out.
          </p>
          <div>
            <Link className="button secondary" href={"/legacy" as Route}>
              Open legacy training dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
