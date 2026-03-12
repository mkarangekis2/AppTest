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
          <span className="badge ghost">Enterprise-grade workflow governance</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Operating system for SMB execution teams</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Design operations, deploy systems, and run AI-enabled execution from one control surface.
          </h1>
        </div>
        <p className="lede">
          Replace fragmented tools with a command-ready platform that diagnoses how your business runs, recommends
          what to install next, and powers daily execution with AI applications, workflows, and KPI visibility.
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
            <strong>12 mission surfaces</strong>
          </div>
          <div className="hero-metric">
            <span className="metric-label">Launch module library</span>
            <strong>50 installable systems</strong>
          </div>
          <div className="hero-metric">
            <span className="metric-label">AI app runtime</span>
            <strong>OpenAI + Anthropic model lane</strong>
          </div>
          <div className="hero-metric">
            <span className="metric-label">Execution model</span>
            <strong>Guided, auditable, explainable</strong>
          </div>
        </div>
      </section>

      <section className="split">
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">What this platform replaces</div>
            <h2 style={{ margin: 0 }}>Disconnected apps, opaque automation, and non-repeatable execution</h2>
          </div>
          <ul className="list-tight">
            <li>Unclear ownership between sales, delivery, support, and leadership</li>
            <li>Recommendations with no reason, no order, and no operational evidence</li>
            <li>Workflows that execute but cannot be audited or improved confidently</li>
            <li>AI usage without governance, versioning, or output accountability</li>
          </ul>
        </article>
        <article className="card stack card-dark">
          <div className="section-heading">
            <div className="eyebrow">What you get instead</div>
            <h2 style={{ margin: 0 }}>A governed operating layer for business execution</h2>
          </div>
          <ul className="list-tight">
            <li>Diagnostic onboarding and structured business analysis</li>
            <li>Config-driven recommendations with implementation sequence</li>
            <li>Installable modules, packages, and vertical-specific presets</li>
            <li>AI app runtime with run history and output inspection</li>
          </ul>
        </article>
      </section>

      <section className="grid two">
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Core platform surfaces</div>
            <h2 style={{ margin: 0 }}>Everything your team needs to run operations in one place</h2>
          </div>
          <div className="grid three">
            <Link className="card-link" href={(user ? "/analysis" : "/login") as Route}>
              <strong>Business Analysis</strong>
              <span className="muted">Maturity scoring, risk areas, opportunity areas, and action summary.</span>
            </Link>
            <Link className="card-link" href={(user ? "/recommendations" : "/login") as Route}>
              <strong>Recommendations</strong>
              <span className="muted">Explainable module and package recommendations with install effort.</span>
            </Link>
            <Link className="card-link" href={(user ? "/apps" : "/login") as Route}>
              <strong>AI App Studio</strong>
              <span className="muted">Build internal AI apps and inspect every execution output.</span>
            </Link>
            <Link className="card-link" href={(user ? "/workflows" : "/login") as Route}>
              <strong>Workflow Center</strong>
              <span className="muted">Trigger-condition-action automation with run controls.</span>
            </Link>
            <Link className="card-link" href={(user ? "/knowledge" : "/login") as Route}>
              <strong>Knowledge System</strong>
              <span className="muted">Upload SOPs and retrieve semantic answers from indexed context.</span>
            </Link>
            <Link className="card-link" href={(user ? "/reports" : "/login") as Route}>
              <strong>Executive Reports</strong>
              <span className="muted">KPI visibility across pipeline, delivery, and automation health.</span>
            </Link>
          </div>
        </article>
        <article className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Core operating loop</div>
            <h2 style={{ margin: 0 }}>Analyze, recommend, install, execute, optimize</h2>
          </div>
          <div className="timeline-list">
            <div className="timeline-item">
              <div className="eyebrow">01 Diagnostic onboarding</div>
              <div className="muted">Capture how your business actually runs, where it slows down, and where value leaks.</div>
            </div>
            <div className="timeline-item">
              <div className="eyebrow">02 Explainable recommendation engine</div>
              <div className="muted">Receive system installs in priority order with impact and complexity guidance.</div>
            </div>
            <div className="timeline-item">
              <div className="eyebrow">03 Controlled deployment</div>
              <div className="muted">Install modules, workflows, and AI apps into a governed workspace.</div>
            </div>
            <div className="timeline-item">
              <div className="eyebrow">04 Operational command view</div>
              <div className="muted">Monitor activity, outcomes, risks, and next actions through executive dashboards.</div>
            </div>
          </div>
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
        <article className="card stack">
          <div className="eyebrow">Optimize</div>
          <h3 style={{ margin: 0 }}>Improve continuously with visibility</h3>
          <p className="muted">Use run outcomes, KPIs, and recommendation evidence to refine systems over time.</p>
        </article>
      </section>
    </div>
  );
}
