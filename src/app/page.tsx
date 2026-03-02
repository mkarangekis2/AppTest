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
    <div className="stack">
      <section className="hero card">
        <div className="eyebrow">Mission Flow</div>
        <h1 style={{ margin: 0 }}>CONOP to scenario, session, and AAR</h1>
        <p className="muted" style={{ margin: 0 }}>
          Build scenarios from operational context, keep proctors in control during live lanes, and generate immediate
          after-action reports.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="button" href="/conops/new">
            Create CONOP
          </Link>
        </div>
      </section>

      <div className="grid two">
        <section className="card stack">
          <div className="eyebrow">Recent CONOPs</div>
          {conops?.length ? (
            conops.map((conop) => (
              <div key={conop.id}>
                <strong>{conop.title}</strong>
                <div className="muted">{new Date(conop.created_at).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="muted">No CONOPs yet.</div>
          )}
        </section>

        <section className="card stack">
          <div className="eyebrow">Scenario Drafts / Approved</div>
          {scenarios?.length ? (
            scenarios.map((scenario) => (
              <Link key={scenario.id} href={`/scenarios/${scenario.id}`} style={{ display: "block" }}>
                <strong>{scenario.name}</strong>
                <div className="muted">
                  {scenario.status} · {new Date(scenario.created_at).toLocaleString()}
                </div>
              </Link>
            ))
          ) : (
            <div className="muted">No scenarios saved yet.</div>
          )}
        </section>
      </div>

      <section className="card stack">
        <div className="eyebrow">Live Sessions</div>
        {sessions?.length ? (
          sessions.map((session) => (
            <Link key={session.id} href={`/sessions/${session.id}`}>
              <strong>{session.mode.toUpperCase()}</strong>
              <div className="muted">
                {new Date(session.started_at).toLocaleString()} · stage {session.current_stage}
              </div>
            </Link>
          ))
        ) : (
          <div className="muted">No live or completed sessions yet.</div>
        )}
      </section>
    </div>
  );
}
