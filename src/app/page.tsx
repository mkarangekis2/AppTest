import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { supabase } = await requireUser();

  const [{ data: conops }, { data: scenarios }, { data: sessions }] = await Promise.all([
    supabase.from("conops").select("id,title,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("scenarios").select("id,name,status,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("sessions").select("id,mode,started_at,current_stage").order("started_at", { ascending: false }).limit(5)
  ]);

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Mission planning surface</span>
          <span className="badge">AI suggestions stay proctor-approved</span>
          <span className="badge ghost">Live scoring and AAR workflow</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Mission Flow</div>
          <h1 className="display-title" style={{ margin: 0 }}>CONOP to live lane, patient progression, and AAR</h1>
        </div>
        <p className="lede">
          Build scenarios from operational context, keep instructors in control during active casualty lanes, and
          generate immediate evaluation artifacts without losing tactical realism.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/conops/new">
            Create CONOP
          </Link>
          <span className="badge warning">Training-only evaluation environment</span>
        </div>
      </section>

      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Recent CONOPs</div>
          <div className="metric-value">{conops?.length || 0}</div>
          <div className="muted">Latest planning packets ready for analysis.</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Scenarios</div>
          <div className="metric-value">{scenarios?.length || 0}</div>
          <div className="muted">Draft and approved scenario packages in the workflow.</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Sessions</div>
          <div className="metric-value">{sessions?.length || 0}</div>
          <div className="muted">Live and recently completed evaluation lanes.</div>
        </div>
      </section>

      <div className="grid two">
        <section className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Recent CONOPs</div>
            <h2 style={{ margin: 0 }}>Mission planning packets</h2>
          </div>
          {conops?.length ? (
            conops.map((conop) => (
              <div key={conop.id} className="card-link">
                <strong>{conop.title}</strong>
                <div className="muted">{new Date(conop.created_at).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="empty-state">No CONOPs yet. Create a mission brief to begin the scenario workflow.</div>
          )}
        </section>

        <section className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Scenarios</div>
            <h2 style={{ margin: 0 }}>Draft packets and approved lanes</h2>
          </div>
          {scenarios?.length ? (
            scenarios.map((scenario) => (
              <Link key={scenario.id} href={`/scenarios/${scenario.id}`} className="card-link">
                <strong>{scenario.name}</strong>
                <div className="muted">
                  {scenario.status} · {new Date(scenario.created_at).toLocaleString()}
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-state">No scenarios saved yet. Analyze a CONOP to produce candidate lane packets.</div>
          )}
        </section>
      </div>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Live Sessions</div>
          <h2 style={{ margin: 0 }}>Active and recent evaluation lanes</h2>
        </div>
        {sessions?.length ? (
          sessions.map((session) => (
            <Link key={session.id} href={`/sessions/${session.id}`} className="card-link">
              <strong>{session.mode.toUpperCase()}</strong>
              <div className="muted">
                {new Date(session.started_at).toLocaleString()} · stage {session.current_stage}
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">No live or completed sessions yet. Start a session from an approved scenario.</div>
        )}
      </section>
    </div>
  );
}
