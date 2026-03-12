import Link from "next/link";
import type { Route } from "next";
import { getOptionalUser } from "@/lib/auth";

export default async function LandingPage() {
  const { user } = await getOptionalUser();

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">ACG AI Operations Platform</span>
          <span className="badge">Outcome-oriented operating system for SMB teams</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Install systems, not point tools</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Run your business through guided analysis, recommendations, and modular operations installs
          </h1>
        </div>
        <p className="lede">
          Diagnose how your company operates, identify bottlenecks and revenue leakage, install packaged systems, and
          activate auditable workflows with executive visibility.
        </p>
        <div className="hero-actions">
          <Link className="button" href={(user ? "/onboarding" : "/login") as Route}>
            Analyze My Business
          </Link>
          <Link className="button secondary" href={(user ? "/dashboard" : "/login") as Route}>
            Explore Systems
          </Link>
        </div>
      </section>

      <section className="grid three">
        <div className="card stack">
          <div className="eyebrow">Diagnostic onboarding</div>
          <h3 style={{ margin: 0 }}>Capture how operations actually run</h3>
          <p className="muted">Collect operating context across lead flow, service delivery, documentation, and admin burden.</p>
        </div>
        <div className="card stack">
          <div className="eyebrow">Explainable recommendations</div>
          <h3 style={{ margin: 0 }}>Prioritized module and package installs</h3>
          <p className="muted">Receive deterministic recommendation logic with implementation order and expected impact.</p>
        </div>
        <div className="card stack">
          <div className="eyebrow">Operational command layer</div>
          <h3 style={{ margin: 0 }}>Dashboards, workflows, and visibility</h3>
          <p className="muted">Monitor workflow activity and business health without losing auditability or control.</p>
        </div>
      </section>
    </div>
  );
}
