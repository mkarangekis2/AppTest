import Link from "next/link";
import type { Route } from "next";
import { getOptionalUser } from "@/lib/auth";

export default async function LandingPage() {
  const { user } = await getOptionalUser();

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero hero-prime">
        <div className="badge-row">
          <span className="badge info">ACG AI Operations Platform</span>
          <span className="badge">Augmentation Consulting Group Inc. product</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Operating system for SMB execution teams</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Install operational systems. Run the business from one command layer.
          </h1>
        </div>
        <p className="lede">
          Replace scattered tools and fragmented processes with guided onboarding, explainable recommendations,
          workflow automation, and role-specific AI apps your teams use daily.
        </p>
        <div className="hero-actions">
          <Link className="button" href={(user ? "/onboarding" : "/login") as Route}>
            Analyze My Business
          </Link>
          <Link className="button secondary" href={(user ? "/apps" : "/login") as Route}>
            Open App Studio
          </Link>
        </div>
        <div className="hero-metrics">
          <div className="hero-metric">
            <span className="metric-label">Operational domains</span>
            <strong>12+</strong>
          </div>
          <div className="hero-metric">
            <span className="metric-label">Launch module library</span>
            <strong>50 Systems</strong>
          </div>
          <div className="hero-metric">
            <span className="metric-label">AI app runtime</span>
            <strong>OpenAI + Anthropic</strong>
          </div>
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
        <article className="card stack card-dark">
          <div className="section-heading">
            <div className="eyebrow">Impact</div>
            <h2 style={{ margin: 0 }}>Where teams see improvement first</h2>
          </div>
          <ul className="list-tight">
            <li>Lead response and follow-up speed</li>
            <li>Operational consistency and handoff quality</li>
            <li>Reduced manual admin and reporting overhead</li>
            <li>Executive visibility across delivery and revenue</li>
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

      <section className="grid three">
        <article className="card stack">
          <div className="eyebrow">Onboard</div>
          <h3 style={{ margin: 0 }}>Model your operating reality</h3>
          <p className="muted">Capture constraints, service complexity, workflow maturity, and growth goals.</p>
        </article>
        <article className="card stack">
          <div className="eyebrow">Install</div>
          <h3 style={{ margin: 0 }}>Deploy systems and workflows</h3>
          <p className="muted">Install modules and packages with built-in workflows, tracking, and governance.</p>
        </article>
        <article className="card stack">
          <div className="eyebrow">Operate</div>
          <h3 style={{ margin: 0 }}>Run daily execution from one layer</h3>
          <p className="muted">Track activity, use AI apps, and monitor executive KPIs in a unified command surface.</p>
        </article>
      </section>
    </div>
  );
}
