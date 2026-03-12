import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function LegacyDashboardPage() {
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
    </div>
  );
}
