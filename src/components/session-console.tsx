"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveSuggestionOutput, Vitals } from "@/lib/domain";
import { buildTreatmentCards, compactVitalsDelta, ScenarioRecord } from "@/lib/scenario-format";
import { applyVitalsDelta } from "@/lib/session-state";

const QUICK_ACTIONS = [
  "Control massive hemorrhage",
  "Open airway",
  "Support breathing",
  "Seal chest wound",
  "Initiate reassessment",
  "Prepare casualty for movement"
] as const;

type EventRow = {
  id: string;
  ts: string;
  type: string;
  payload_json: Record<string, unknown>;
};

type ActionStatus = "correct" | "delayed" | "missed" | null;
type VitalsDelta = LiveSuggestionOutput["suggested_state_transition"]["vitals_delta"];

const STAGE_STYLES: Record<string, { border: string; background: string }> = {
  stable: { border: "#6f8a4b", background: "rgba(111, 138, 75, 0.08)" },
  worsening: { border: "#b9893f", background: "rgba(185, 137, 63, 0.12)" },
  critical: { border: "#9a4b43", background: "rgba(154, 75, 67, 0.12)" }
};

const VITAL_LABELS: Array<{ key: keyof VitalsDelta; label: string; improveOnDecrease?: boolean }> = [
  { key: "hr", label: "HR", improveOnDecrease: true },
  { key: "rr", label: "RR", improveOnDecrease: true },
  { key: "spo2", label: "SpO2" },
  { key: "bp_sys", label: "BP Sys" },
  { key: "bp_dia", label: "BP Dia" },
  { key: "pain_0_10", label: "Pain", improveOnDecrease: true }
];

export function SessionConsole({
  sessionId,
  scenario,
  currentStage,
  currentVitals,
  events,
  endedAt
}: {
  sessionId: string;
  scenario: Record<string, unknown>;
  currentStage: string;
  currentVitals: Record<string, unknown>;
  events: EventRow[];
  endedAt: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<LiveSuggestionOutput | null>(null);
  const [displayStage, setDisplayStage] = useState(currentStage);
  const [displayVitals, setDisplayVitals] = useState(currentVitals as Vitals);
  const [appliedSuggestion, setAppliedSuggestion] = useState<LiveSuggestionOutput | null>(null);

  const treatmentCards = useMemo(() => buildTreatmentCards(scenario as ScenarioRecord), [scenario]);

  useEffect(() => {
    setDisplayStage(currentStage);
    setDisplayVitals(currentVitals as Vitals);
  }, [currentStage, currentVitals]);

  const configuredActionSet = useMemo(() => {
    const environment = scenario.environment_json as { medic_action_set?: string[] } | undefined;
    return environment?.medic_action_set?.length ? environment.medic_action_set : [...QUICK_ACTIONS];
  }, [scenario]);

  const actionStates = useMemo(() => {
    const map = new Map<string, { mark: ActionStatus; ts: string | null }>();

    for (const event of events) {
      if (event.type === "score_mark") {
        const action = String(event.payload_json.rubric_action || "");
        const mark = event.payload_json.mark;
        if (!action || (mark !== "correct" && mark !== "delayed" && mark !== "missed")) {
          continue;
        }
        map.set(action, { mark, ts: event.ts });
      }

      if (event.type === "score_reset") {
        const action = String(event.payload_json.rubric_action || "");
        if (action) {
          map.set(action, { mark: null, ts: null });
        }
      }
    }

    return map;
  }, [events]);

  const scoreMarks = useMemo(() => {
    const map = new Map<string, string>();
    for (const [action, state] of actionStates.entries()) {
      if (state.mark) {
        map.set(action, state.mark);
      }
    }
    return map;
  }, [actionStates]);

  const latestChanges = useMemo(() => {
    return events
      .filter((event) => event.type === "patient_change")
      .slice(-3)
      .reverse();
  }, [events]);

  async function logEvent(type: string, payload: Record<string, unknown>) {
    setPending(type);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload })
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Action failed.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
      throw err;
    } finally {
      setPending(null);
    }
  }

  async function getSuggestion() {
    setPending("suggestion");
    setError(null);
    try {
      const response = await fetch("/api/ai/suggest-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      const body = (await response.json()) as LiveSuggestionOutput & { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Suggestion failed.");
      }
      setSuggestion(body);
      await logEvent("ai_suggestion", { suggestion: body });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suggestion failed.");
      setPending(null);
    }
  }

  async function applySuggestion() {
    if (!suggestion) {
      return;
    }
    setPending("apply");
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suggestion)
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Transition failed.");
      }
      const nextVitals = applyVitalsDelta(displayVitals, suggestion.suggested_state_transition.vitals_delta);
      setDisplayStage(suggestion.suggested_state_transition.to_stage);
      setDisplayVitals(nextVitals);
      setAppliedSuggestion(suggestion);
      router.refresh();
      setSuggestion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition failed.");
    } finally {
      setPending(null);
    }
  }

  async function markScore(action: string, mark: ActionStatus) {
    if (!mark) {
      return;
    }
    await logEvent("score_mark", { rubric_action: action, mark, source: "proctor-confirmed" });
  }

  async function resetScore(action: string) {
    await logEvent("score_reset", { rubric_action: action, source: "proctor-reset" });
  }

  async function endSession() {
    setPending("end");
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/end`, { method: "POST" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "End session failed.");
      }
      router.push(`/sessions/${sessionId}/aar`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "End session failed.");
    } finally {
      setPending(null);
    }
  }

  const appliedStageStyle = STAGE_STYLES[displayStage] || STAGE_STYLES.worsening;
  const appliedDelta = appliedSuggestion?.suggested_state_transition.vitals_delta;

  return (
    <div className="split">
      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Treatment control</div>
          <h2 style={{ margin: 0 }}>Grade the lane one decisive action at a time</h2>
        </div>
        <div className="command-grid">
          {(treatmentCards.length ? treatmentCards : configuredActionSet.map((action) => ({
            action,
            deadlineSec: null,
            failIfMissed: false,
            reason: "No authored treatment note.",
            visibleCues: [],
            ifDone: [],
            ifMissed: [],
            stageEffects: []
          }))).map((card) => {
            const scoreMark = scoreMarks.get(card.action) as ActionStatus;

            return (
              <div key={card.action} className={`command-card ${scoreMark ? "active" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{card.action}</strong>
                  <div className="badge-row">
                    {card.deadlineSec !== null ? <span className="badge">Due {card.deadlineSec}s</span> : null}
                    {card.failIfMissed ? <span className="badge danger">Critical</span> : null}
                    {scoreMark ? <span className={`badge ${scoreMark === "missed" ? "danger" : scoreMark === "delayed" ? "warning" : ""}`}>{scoreMark}</span> : null}
                  </div>
                </div>
                <div>{card.reason}</div>
                {card.visibleCues.length ? (
                  <div className="muted">Look for: {card.visibleCues.join("; ")}</div>
                ) : null}
                <div className="grid two">
                  <div className="packet-block">
                    <div className="eyebrow">If completed</div>
                    <ul className="list-tight">
                      {card.ifDone.length ? card.ifDone.map((item) => <li key={item}>{item}</li>) : <li>No authored improvement.</li>}
                    </ul>
                  </div>
                  <div className="packet-block">
                    <div className="eyebrow">If missed</div>
                    <ul className="list-tight">
                      {card.ifMissed.length ? card.ifMissed.map((item) => <li key={item}>{item}</li>) : <li>No authored deterioration.</li>}
                    </ul>
                  </div>
                </div>
                <div className="command-actions">
                  <button
                    className={`score-button ${scoreMark === "correct" ? "correct-active" : "secondary"}`}
                    disabled={Boolean(endedAt) || pending !== null}
                    onClick={() => markScore(card.action, "correct")}
                  >
                    Correct
                  </button>
                  <button
                    className={`score-button ${scoreMark === "delayed" ? "delayed-active" : "secondary"}`}
                    disabled={Boolean(endedAt) || pending !== null}
                    onClick={() => markScore(card.action, "delayed")}
                  >
                    Delayed
                  </button>
                  <button
                    className={`score-button ${scoreMark === "missed" ? "missed-active" : "secondary"}`}
                    disabled={Boolean(endedAt) || pending !== null}
                    onClick={() => markScore(card.action, "missed")}
                  >
                    Missed
                  </button>
                  <button
                    className="secondary"
                    disabled={Boolean(endedAt) || pending !== null || !scoreMark}
                    onClick={() => resetScore(card.action)}
                  >
                    Undo
                  </button>
                </div>
                <div className={`selection-state ${scoreMark || ""}`}>
                  {scoreMark === "correct" ? "Recorded as completed on time." : null}
                  {scoreMark === "delayed" ? "Recorded as completed, but delayed." : null}
                  {scoreMark === "missed" ? "Recorded as missed / not completed." : null}
                  {!scoreMark ? "No result recorded yet." : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="action-row">
          <button className="secondary" disabled={Boolean(endedAt) || pending !== null} onClick={getSuggestion}>
            {pending === "suggestion" ? "Loading..." : "Get AI Suggestion"}
          </button>
          <button className="danger" disabled={Boolean(endedAt) || pending !== null} onClick={endSession}>
            {pending === "end" ? "Ending..." : "End Session"}
          </button>
        </div>
        {error ? <div className="badge danger">{error}</div> : null}
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {events.length ? (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>{new Date(event.ts).toLocaleTimeString()}</td>
                    <td>{event.type}</td>
                    <td>{JSON.stringify(event.payload_json)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No events yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Patient state / guidance</div>
          <h2 style={{ margin: 0 }}>Track what is suggested, what is applied, and what changes now</h2>
        </div>
        <div className={`status-panel ${displayStage}`}>
          {appliedSuggestion ? (
            <div className="command-card active" style={{ borderColor: appliedStageStyle.border, background: appliedStageStyle.background }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <strong>Applied patient update</strong>
                <span className="badge">{appliedSuggestion.suggested_state_transition.to_stage}</span>
              </div>
              <div>{appliedSuggestion.suggested_state_transition.reason}</div>
              <div className="muted">{compactVitalsDelta(appliedSuggestion.suggested_state_transition.vitals_delta)}</div>
              <div className="grid two">
                <div className="packet-block">
                  <div className="eyebrow">Patient now does</div>
                  <ul className="list-tight">
                    {appliedSuggestion.suggested_patient_response.what_patient_does.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="packet-block">
                  <div className="eyebrow">Proctor says</div>
                  <ul className="list-tight">
                    {appliedSuggestion.suggested_patient_response.proctor_verbatim_lines.map((line) => <li key={line}>{line}</li>)}
                  </ul>
                </div>
              </div>
              <div className="badge-row">
                {VITAL_LABELS.map((item) => (
                  <VitalsTrendChip key={item.key} label={item.label} value={appliedSuggestion.suggested_state_transition.vitals_delta[item.key]} improveOnDecrease={item.improveOnDecrease} />
                ))}
              </div>
            </div>
          ) : null}
          <strong>Current stage</strong>
          <div className="badge-row">
            <span className={`badge ${displayStage === "critical" ? "danger" : displayStage === "worsening" ? "warning" : ""}`}>{displayStage}</span>
          </div>
          <div className="table">
            <table>
              <tbody>
                <tr><th>HR</th><td>{String(displayVitals.hr ?? "-")}</td><th>RR</th><td>{String(displayVitals.rr ?? "-")}</td></tr>
                <tr>
                  <th>SpO2</th>
                  <td>
                    {String(displayVitals.spo2 ?? "-")}
                    {appliedDelta ? <InlineVitalsDelta value={appliedDelta.spo2} improveOnDecrease={false} /> : null}
                  </td>
                  <th>BP</th>
                  <td>
                    {`${String(displayVitals.bp_sys ?? "-")}/${String(displayVitals.bp_dia ?? "-")}`}
                    {appliedDelta ? <InlineBloodPressureDelta sys={appliedDelta.bp_sys} dia={appliedDelta.bp_dia} /> : null}
                  </td>
                </tr>
                <tr>
                  <th>Pain</th>
                  <td>
                    {String(displayVitals.pain_0_10 ?? "-")}/10
                    {appliedDelta ? <InlineVitalsDelta value={appliedDelta.pain_0_10} improveOnDecrease /> : null}
                  </td>
                  <th>Temp C</th>
                  <td>{String(displayVitals.temp_c ?? "-")}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="info-grid">
            <VitalsSnapshot label="HR" value={displayVitals.hr} delta={appliedDelta?.hr} improveOnDecrease />
            <VitalsSnapshot label="RR" value={displayVitals.rr} delta={appliedDelta?.rr} improveOnDecrease />
            <VitalsSnapshot label="SpO2" value={displayVitals.spo2} delta={appliedDelta?.spo2} />
            <VitalsSnapshot label="Pain" value={displayVitals.pain_0_10} delta={appliedDelta?.pain_0_10} improveOnDecrease suffix="/10" />
          </div>
          <strong>Recent patient changes</strong>
          <ul className="list-tight">
            {latestChanges.length ? latestChanges.map((event) => (
              <li key={event.id}>
                {new Date(event.ts).toLocaleTimeString()}: {String(event.payload_json.reason || "Patient state updated.")}
              </li>
            )) : <li>No applied patient changes yet.</li>}
          </ul>
        </div>

        <div className="command-card">
          <strong>Lane notes</strong>
          <div className="field">
            <label htmlFor="note">Add note</label>
            <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <div className="action-row">
            <button
              className="secondary"
              disabled={Boolean(endedAt) || pending !== null || !note.trim()}
              onClick={async () => {
                await logEvent("note", { note });
                setNote("");
              }}
            >
              Add Note
            </button>
          </div>
        </div>

        <div className="command-card">
          <strong>AI suggestion</strong>
          {!suggestion ? (
            <div className="empty-state">No active suggestion. Use Get AI Suggestion after logging medic actions.</div>
          ) : (
            <>
              <div className="muted">{suggestion.recognized_medic_action}</div>
              <div className="packet-block">
                <div className="eyebrow">Proctor delivery</div>
                <ul className="list-tight">
                  {suggestion.suggested_patient_response.proctor_verbatim_lines.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </div>
              <div className="packet-block">
                <div className="eyebrow">Patient behavior</div>
                <ul className="list-tight">
                  {suggestion.suggested_patient_response.what_patient_does.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="packet-block">
                <div className="eyebrow">Suggested state change</div>
                <div>
                  Move to <strong>{suggestion.suggested_state_transition.to_stage}</strong> over{" "}
                  {suggestion.suggested_state_transition.apply_over_sec}s.
                </div>
                <div>{suggestion.suggested_state_transition.reason}</div>
                <div className="muted">{compactVitalsDelta(suggestion.suggested_state_transition.vitals_delta)}</div>
              </div>
              <div className="packet-block">
                <div className="eyebrow">Scoring note</div>
                <div>
                  {suggestion.scoring_suggestion.rubric_action}: {suggestion.scoring_suggestion.mark}
                </div>
                <div className="muted">{suggestion.scoring_suggestion.notes}</div>
              </div>
              <div className="action-row">
                <button disabled={Boolean(endedAt) || pending !== null} onClick={applySuggestion}>
                  {pending === "apply" ? "Applying..." : "Apply Suggested Transition"}
                </button>
                <button
                  className="secondary"
                  disabled={Boolean(endedAt) || pending !== null}
                  onClick={() => logEvent("proctor_override", { rejected_suggestion: suggestion })}
                >
                  Override Suggestion
                </button>
              </div>
            </>
          )}
        </div>

        <div className="command-card">
          <strong>Proctor score state</strong>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Medic did it</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {(treatmentCards.length ? treatmentCards.map((item) => item.action) : configuredActionSet).map((action) => (
                  <tr key={action}>
                    <td>{action}</td>
                    <td>{scoreMarks.get(action) === "correct" || scoreMarks.get(action) === "delayed" ? "Yes" : "No"}</td>
                    <td>{scoreMarks.get(action) || "Unmarked"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function VitalsSnapshot({
  label,
  value,
  delta,
  improveOnDecrease = false,
  suffix = ""
}: {
  label: string;
  value: number;
  delta?: number;
  improveOnDecrease?: boolean;
  suffix?: string;
}) {
  const tone = getDeltaTone(delta, improveOnDecrease);

  return (
    <div className="metric-card">
      <div className="eyebrow">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <strong style={{ fontSize: "1.15rem" }}>{value}{suffix}</strong>
        {delta !== undefined ? <InlineVitalsDelta value={delta} improveOnDecrease={improveOnDecrease} /> : null}
      </div>
      <div className="muted">{tone.label}</div>
    </div>
  );
}

function VitalsTrendChip({
  label,
  value,
  improveOnDecrease = false
}: {
  label: string;
  value: number;
  improveOnDecrease?: boolean;
}) {
  const tone = getDeltaTone(value, improveOnDecrease);

  return (
    <span
      className="badge"
      style={{
        borderColor: tone.border,
        background: tone.background,
        color: tone.text
      }}
    >
      {label} {formatSignedNumber(value)}
    </span>
  );
}

function InlineVitalsDelta({
  value,
  improveOnDecrease = false
}: {
  value: number;
  improveOnDecrease?: boolean;
}) {
  const tone = getDeltaTone(value, improveOnDecrease);

  return (
    <span style={{ marginLeft: 6, color: tone.text, fontWeight: 700 }}>
      {formatSignedNumber(value)}
    </span>
  );
}

function InlineBloodPressureDelta({ sys, dia }: { sys: number; dia: number }) {
  const combined = sys + dia;
  const tone = getDeltaTone(combined, false);

  return (
    <span style={{ marginLeft: 6, color: tone.text, fontWeight: 700 }}>
      ({formatSignedNumber(sys)}/{formatSignedNumber(dia)})
    </span>
  );
}

function getDeltaTone(value: number | undefined, improveOnDecrease: boolean) {
  if (value === undefined || value === 0) {
    return {
      label: "No immediate change",
      text: "#6b6257",
      border: "rgba(107, 98, 87, 0.25)",
      background: "rgba(107, 98, 87, 0.08)"
    };
  }

  const isImprovement = improveOnDecrease ? value < 0 : value > 0;

  return isImprovement
    ? {
        label: "Improving response",
        text: "#5f7a3f",
        border: "rgba(95, 122, 63, 0.3)",
        background: "rgba(95, 122, 63, 0.12)"
      }
    : {
        label: "Worsening response",
        text: "#9a4b43",
        border: "rgba(154, 75, 67, 0.3)",
        background: "rgba(154, 75, 67, 0.12)"
      };
}

function formatSignedNumber(value: number) {
  if (value === 0) {
    return "0";
  }

  return value > 0 ? `+${value}` : String(value);
}
