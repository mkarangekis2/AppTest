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
          <span className="badge">Augmentation Consulting Group Inc. product</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Install systems, not disconnected tools</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Run your business with AI apps, workflow systems, and explainable operational guidance
          </h1>
        </div>
        <p className="lede">
          ACG provides a full operations layer: onboarding diagnostics, analysis and recommendation engines, installable
          module systems, and company-specific AI apps your teams can run every day.
        </p>
        <div className="hero-actions">
          <Link className="button" href={(user ? "/onboarding" : "/login") as Route}>
            Analyze My Business
          </Link>
          <Link className="button secondary" href={(user ? "/apps" : "/login") as Route}>
            Build AI Apps
          </Link>
        </div>
      </section>

      <section className="grid three">
        <div className="card stack">
          <div className="eyebrow">Diagnostic onboarding</div>
          <h3 style={{ margin: 0 }}>Capture your operating model</h3>
          <p className="muted">Collect structured context for lead flow, support, delivery, risk, and growth priorities.</p>
        </div>
        <div className="card stack">
          <div className="eyebrow">Explainable recommendations</div>
          <h3 style={{ margin: 0 }}>Prioritized installs with rationale</h3>
          <p className="muted">Get module, package, and industry-pack recommendations with evidence and setup effort.</p>
        </div>
        <div className="card stack">
          <div className="eyebrow">AI app platform</div>
          <h3 style={{ margin: 0 }}>Create and run internal AI apps</h3>
          <p className="muted">Build prompt-driven apps per team use case and run them using OpenAI or Anthropic models.</p>
        </div>
      </section>

      <section className="grid two">
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Who this is for</div>
            <h2 style={{ margin: 0 }}>Owner-led and manager-led SMB teams</h2>
          </div>
          <ul className="list-tight">
            <li>IT and managed services</li>
            <li>Construction and trades</li>
            <li>Professional services and advisory</li>
            <li>Staffing, logistics, and operations-heavy teams</li>
          </ul>
        </article>
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Core loop</div>
            <h2 style={{ margin: 0 }}>Analyze, recommend, install, operate, optimize</h2>
          </div>
          <p className="muted">
            Every screen maps to this operating cycle, so teams can move from diagnosis to execution with measurable
            improvement and consistent governance.
          </p>
        </article>
      </section>
    </div>
  );
}
