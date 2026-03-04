import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SessionConsole } from "@/components/session-console";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireUser();

  const [{ data: session }, { data: events }] = await Promise.all([
    supabase.from("sessions").select("*, scenarios(*)").eq("id", params.id).maybeSingle(),
    supabase.from("events").select("*").eq("session_id", params.id).order("ts", { ascending: true })
  ]);

  if (!session) {
    notFound();
  }

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Live session</span>
          <span className="badge">{session.mode}</span>
          <span className={`badge ${session.current_stage === "critical" ? "danger" : session.current_stage === "worsening" ? "warning" : ""}`}>
            stage {session.current_stage}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div className="stack">
            <div className="eyebrow">Exercise control</div>
            <h1 className="display-title" style={{ margin: 0 }}>{session.scenarios?.name || "Scenario"}</h1>
            <div className="lede">
              {session.mode} · stage {session.current_stage}
            </div>
          </div>
          <Link href={`/sessions/${session.id}/aar`} className="button secondary">
            View AAR
          </Link>
        </div>
      </section>
      <SessionConsole
        sessionId={session.id}
        scenario={session.scenarios}
        currentStage={session.current_stage}
        currentVitals={session.current_vitals_json}
        events={events || []}
        endedAt={session.ended_at}
      />
    </div>
  );
}
