"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveSuggestionOutput } from "@/lib/domain";
import { buildTreatmentCards, compactVitalsDelta, ScenarioRecord } from "@/lib/scenario-format";

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

  const treatmentCards = useMemo(() => {
    return buildTreatmentCards(scenario as ScenarioRecord);
  }, [scenario]);

  const configuredActionSet = useMemo(() => {
    const environment = scenario.environment_json as { medic_action_set?: string[] } | undefined;
    return environment?.medic_action_set?.length ? environment.medic_action_set : [...QUICK_ACTIONS];
  }, [scenario]);

  const completedActions = useMemo(() => {
    return new Set(
      events
        .filter((event) => event.type === "medic_action")
        .map((event) => String(event.payload_json.action || ""))
    );
  }, [events]);

  const scoreMarks = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of events.filter((item) => item.type === "score_mark")) {
      const action = String(event.payload_json.rubric_action || "");
      if (action) {
        map.set(action, String(event.payload_json.mark || ""));
      }
    }
    return map;
  }, [events]);

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
      router.refresh();
      setSuggestion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition failed.");
    } finally {
      setPending(null);
    }
  }

  async function markScore(action: string, mark: LiveSuggestionOutput["scoring_suggestion"]["mark"]) {
    await logEvent("score_mark", { rubric_action: action, mark, source: "proctor-confirmed" });
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

  return (
    <div className="split">
      <section className="card stack">
        <div className="eyebrow">Treatment Checklist</div>
        <div className="stack">
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
            const isChecked = completedActions.has(card.action);
            const scoreMark = scoreMarks.get(card.action);

            return (
              <div key={card.action} className="panel" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={Boolean(endedAt) || pending !== null || isChecked}
                      onChange={() => logEvent("medic_action", { action: card.action, source: "treatment-checklist" })}
                    />
                    {card.action}
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {card.deadlineSec !== null ? <span className="badge">Due {card.deadlineSec}s</span> : null}
                    {card.failIfMissed ? <span className="badge">Critical</span> : null}
                    {scoreMark ? <span className="badge">{scoreMark}</span> : null}
                  </div>
                </div>
                <div>{card.reason}</div>
                {card.visibleCues.length ? (
                  <div className="muted">Look for: {card.visibleCues.join("; ")}</div>
                ) : null}
                <div className="grid two">
                  <div className="panel" style={{ padding: 12 }}>
                    <div className="eyebrow">If completed</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {card.ifDone.length ? card.ifDone.map((item) => <li key={item}>{item}</li>) : <li>No authored improvement.</li>}
                    </ul>
                  </div>
                  <div className="panel" style={{ padding: 12 }}>
                    <div className="eyebrow">If missed</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {card.ifMissed.length ? card.ifMissed.map((item) => <li key={item}>{item}</li>) : <li>No authored deterioration.</li>}
                    </ul>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="secondary" disabled={Boolean(endedAt) || pending !== null} onClick={() => markScore(card.action, "correct")}>
                    Correct
                  </button>
                  <button className="secondary" disabled={Boolean(endedAt) || pending !== null} onClick={() => markScore(card.action, "delayed")}>
                    Delayed
                  </button>
                  <button className="secondary" disabled={Boolean(endedAt) || pending !== null} onClick={() => markScore(card.action, "missed")}>
                    Missed
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="field">
          <label htmlFor="note">Add note</label>
          <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="secondary" disabled={Boolean(endedAt) || pending !== null} onClick={getSuggestion}>
            {pending === "suggestion" ? "Loading..." : "Get AI Suggestion"}
          </button>
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
          <button className="danger" disabled={Boolean(endedAt) || pending !== null} onClick={endSession}>
            {pending === "end" ? "Ending..." : "End Session"}
          </button>
        </div>
        {error ? <div className="muted">{error}</div> : null}
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
        <div className="eyebrow">Patient State / Guidance</div>
        <div className="panel stack">
          <strong>Current stage</strong>
          <span className="badge">{currentStage}</span>
          <div className="table">
            <table>
              <tbody>
                <tr><th>HR</th><td>{String(currentVitals.hr ?? "-")}</td><th>RR</th><td>{String(currentVitals.rr ?? "-")}</td></tr>
                <tr><th>SpO2</th><td>{String(currentVitals.spo2 ?? "-")}</td><th>BP</th><td>{`${String(currentVitals.bp_sys ?? "-")}/${String(currentVitals.bp_dia ?? "-")}`}</td></tr>
                <tr><th>Pain</th><td>{String(currentVitals.pain_0_10 ?? "-")}/10</td><th>Temp C</th><td>{String(currentVitals.temp_c ?? "-")}</td></tr>
              </tbody>
            </table>
          </div>
          <strong>Recent patient changes</strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {latestChanges.length ? latestChanges.map((event) => (
              <li key={event.id}>
                {new Date(event.ts).toLocaleTimeString()}: {String(event.payload_json.reason || "Patient state updated.")}
              </li>
            )) : <li>No applied patient changes yet.</li>}
          </ul>
        </div>

        <div className="panel stack">
          <strong>AI suggestion</strong>
          {!suggestion ? (
            <div className="muted">No active suggestion. Use Get AI Suggestion after logging medic actions.</div>
          ) : (
            <>
              <div className="muted">{suggestion.recognized_medic_action}</div>
              <div className="panel" style={{ padding: 12 }}>
                <div className="eyebrow">Proctor delivery</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {suggestion.suggested_patient_response.proctor_verbatim_lines.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </div>
              <div className="panel" style={{ padding: 12 }}>
                <div className="eyebrow">Patient behavior</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {suggestion.suggested_patient_response.what_patient_does.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="panel" style={{ padding: 12 }}>
                <div className="eyebrow">Suggested state change</div>
                <div>
                  Move to <strong>{suggestion.suggested_state_transition.to_stage}</strong> over{" "}
                  {suggestion.suggested_state_transition.apply_over_sec}s.
                </div>
                <div>{suggestion.suggested_state_transition.reason}</div>
                <div className="muted">{compactVitalsDelta(suggestion.suggested_state_transition.vitals_delta)}</div>
              </div>
              <div className="panel" style={{ padding: 12 }}>
                <div className="eyebrow">Scoring note</div>
                <div>
                  {suggestion.scoring_suggestion.rubric_action}: {suggestion.scoring_suggestion.mark}
                </div>
                <div className="muted">{suggestion.scoring_suggestion.notes}</div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

        <div className="panel stack">
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
                    <td>{completedActions.has(action) ? "Yes" : "No"}</td>
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
