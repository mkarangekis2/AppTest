import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { buildAar } from "@/lib/scoring";
import { buildTreatmentCards, compactVitalsDelta } from "@/lib/scenario-format";

export default async function AarPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireUser();
  const [{ data: session }, { data: events }, { data: score }] = await Promise.all([
    supabase.from("sessions").select("*, scenarios(*)").eq("id", params.id).maybeSingle(),
    supabase.from("events").select("*").eq("session_id", params.id).order("ts", { ascending: true }),
    supabase.from("scores").select("*").eq("session_id", params.id).maybeSingle()
  ]);

  if (!session) {
    notFound();
  }

  const timeline = buildAar(events || []);
  const treatmentCards = buildTreatmentCards(session.scenarios);
  const scoreJson = (score?.score_json as {
    total_possible?: number;
    total_awarded?: number;
    critical_actions?: Array<{ action: string; elapsed_sec: number | null; status: string; must_occur_by_sec: number }>;
    remediation_points?: string[];
    mark_details?: Array<{ action: string; mark: string; notes: string }>;
  }) || { remediation_points: [], mark_details: [], critical_actions: [] };
  const environment = (session.scenarios?.environment_json as {
    medic_action_set_name?: string;
    medic_action_set?: string[];
    lane_type?: string;
  }) || { medic_action_set: [] };

  return (
    <div className="stack">
      <section className="card stack">
        <div className="eyebrow">After-Action Report</div>
        <h1 style={{ margin: 0 }}>{session.scenarios?.name || "Scenario"} AAR</h1>
        <div className="muted">Printable report view. Use the browser print dialog for PDF export.</div>
      </section>
      <section className="grid two">
        <div className="card stack">
          <div className="eyebrow">Score Summary</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span className="badge">Awarded {scoreJson.total_awarded ?? 0}</span>
            <span className="badge">Possible {scoreJson.total_possible ?? 0}</span>
            <span className="badge">{environment.medic_action_set_name || "Action set"}</span>
          </div>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Critical action</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Window</th>
                </tr>
              </thead>
              <tbody>
                {(scoreJson.critical_actions || []).map((item) => (
                  <tr key={item.action}>
                    <td>{item.action}</td>
                    <td>{item.status}</td>
                    <td>{item.elapsed_sec === null ? "Not completed" : `${item.elapsed_sec}s`}</td>
                    <td>{item.must_occur_by_sec}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card stack">
          <div className="eyebrow">Session State</div>
          <div className="badge">Final stage {session.current_stage}</div>
          <div className="table">
            <table>
              <tbody>
                <tr><th>HR</th><td>{String(session.current_vitals_json.hr ?? "-")}</td><th>RR</th><td>{String(session.current_vitals_json.rr ?? "-")}</td></tr>
                <tr><th>SpO2</th><td>{String(session.current_vitals_json.spo2 ?? "-")}</td><th>BP</th><td>{`${String(session.current_vitals_json.bp_sys ?? "-")}/${String(session.current_vitals_json.bp_dia ?? "-")}`}</td></tr>
                <tr><th>Pain</th><td>{String(session.current_vitals_json.pain_0_10 ?? "-")}/10</td><th>Temp C</th><td>{String(session.current_vitals_json.temp_c ?? "-")}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="muted">
            Started {new Date(session.started_at).toLocaleString()} · Ended{" "}
            {session.ended_at ? new Date(session.ended_at).toLocaleString() : "in progress"}
          </div>
        </div>
      </section>
      <section className="grid two">
        <div className="card stack">
          <div className="eyebrow">Treatment Outcome Review</div>
          <div className="stack">
            {treatmentCards.map((card) => {
              const mark = (scoreJson.mark_details || []).find((item) => item.action === card.action);
              const critical = (scoreJson.critical_actions || []).find((item) => item.action === card.action);
              return (
                <div key={card.action} className="panel" style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{card.action}</strong>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {critical ? <span className="badge">{critical.status}</span> : null}
                      {mark?.mark ? <span className="badge">{mark.mark}</span> : null}
                    </div>
                  </div>
                  <div>{card.reason}</div>
                  <div className="muted">
                    {card.stageEffects.length
                      ? card.stageEffects.map((effect) => `${effect.toStage} in ${effect.timeWindowSec}s: ${compactVitalsDelta(effect.delta)}`).join(" ")
                      : "No authored stage effect."}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card stack">
          <div className="eyebrow">Remediation</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {(scoreJson.remediation_points || []).length
              ? (scoreJson.remediation_points || []).map((item) => <li key={item}>{item}</li>)
              : <li>No remediation points generated.</li>}
          </ul>
          <div className="eyebrow">Lane Action Set</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(environment.medic_action_set || []).map((action) => <span key={action} className="badge">{action}</span>)}
          </div>
        </div>
      </section>
      <section className="card stack">
        <div className="eyebrow">Timeline Replay</div>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.ts).toLocaleString()}</td>
                  <td>{item.type}</td>
                  <td>{item.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
