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
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">After-action report</span>
          <span className="badge">{environment.lane_type || "lane"}</span>
          <span className={`badge ${session.current_stage === "critical" ? "danger" : session.current_stage === "worsening" ? "warning" : ""}`}>
            Final stage {session.current_stage}
          </span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">AAR packet</div>
          <h1 className="display-title" style={{ margin: 0 }}>{session.scenarios?.name || "Scenario"} AAR</h1>
        </div>
        <p className="lede">Printable review surface for score summary, critical actions, patient outcome, and remediation priorities.</p>
      </section>

      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Awarded</div>
          <div className="metric-value">{scoreJson.total_awarded ?? 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Possible</div>
          <div className="metric-value">{scoreJson.total_possible ?? 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Action set</div>
          <div className="metric-value" style={{ fontSize: "1.05rem" }}>{environment.medic_action_set_name || "Action set"}</div>
        </div>
      </section>

      <section className="packet-grid two">
        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Critical action review</div>
            <h2 style={{ margin: 0 }}>Time and status against lane windows</h2>
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
                    <td>
                      <span className={`badge ${item.status === "missed" ? "danger" : item.status === "delayed" ? "warning" : ""}`}>{item.status}</span>
                    </td>
                    <td>{item.elapsed_sec === null ? "Not completed" : `${item.elapsed_sec}s`}</td>
                    <td>{item.must_occur_by_sec}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Final patient state</div>
            <h2 style={{ margin: 0 }}>Lane outcome at session end</h2>
          </div>
          <div className={`status-panel ${session.current_stage || "worsening"}`}>
            <div className="badge-row">
              <span className="badge">Final stage {session.current_stage}</span>
              <span className="badge ghost">{session.ended_at ? "Session complete" : "In progress"}</span>
            </div>
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
        </div>
      </section>

      <section className="packet-grid two">
        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Treatment outcome review</div>
            <h2 style={{ margin: 0 }}>How each expected action affected the lane</h2>
          </div>
          <div className="stack">
            {treatmentCards.map((card) => {
              const mark = (scoreJson.mark_details || []).find((item) => item.action === card.action);
              const critical = (scoreJson.critical_actions || []).find((item) => item.action === card.action);
              return (
                <div key={card.action} className="command-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{card.action}</strong>
                    <div className="badge-row">
                      {critical ? <span className={`badge ${critical.status === "missed" ? "danger" : critical.status === "delayed" ? "warning" : ""}`}>{critical.status}</span> : null}
                      {mark?.mark ? <span className={`badge ${mark.mark === "missed" ? "danger" : mark.mark === "delayed" ? "warning" : ""}`}>{mark.mark}</span> : null}
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
          <div className="section-heading">
            <div className="eyebrow">Remediation priorities</div>
            <h2 style={{ margin: 0 }}>What to coach before the next lane</h2>
          </div>
          <div className="packet-block">
            <ul className="list-tight">
              {(scoreJson.remediation_points || []).length
                ? (scoreJson.remediation_points || []).map((item) => <li key={item}>{item}</li>)
                : <li>No remediation points generated.</li>}
            </ul>
          </div>
          <div className="packet-block">
            <div className="eyebrow">Lane action set</div>
            <div className="badge-row">
              {(environment.medic_action_set || []).map((action) => <span key={action} className="badge">{action}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Timeline replay</div>
          <h2 style={{ margin: 0 }}>Chronological reconstruction of the lane</h2>
        </div>
        <div className="timeline-list">
          {timeline.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-meta">
                <span className="badge ghost">{new Date(item.ts).toLocaleString()}</span>
                <span className="badge info">{item.type}</span>
              </div>
              <div>{item.summary}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
