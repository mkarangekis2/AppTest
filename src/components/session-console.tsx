"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveSuggestionOutput } from "@/lib/domain";

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

  const rubricActions = useMemo(() => {
    const rubric = scenario.rubric_json as { critical_actions?: Array<{ action: string }> } | undefined;
    return rubric?.critical_actions?.map((item) => item.action) || [...QUICK_ACTIONS];
  }, [scenario]);

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
        <div className="eyebrow">Medic Actions</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              className="secondary"
              disabled={Boolean(endedAt) || pending !== null}
              onClick={() => logEvent("medic_action", { action })}
            >
              {action}
            </button>
          ))}
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
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(currentVitals, null, 2)}</pre>
        </div>

        <div className="panel stack">
          <strong>AI suggestion</strong>
          {!suggestion ? (
            <div className="muted">No active suggestion. Use Get AI Suggestion after logging medic actions.</div>
          ) : (
            <>
              <div className="muted">{suggestion.recognized_medic_action}</div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(suggestion, null, 2)}</pre>
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
          <strong>Rubric checklist</strong>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {rubricActions.map((action) => (
              <div key={action} className="stack" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 12 }}>
                <div>{action}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="secondary" disabled={Boolean(endedAt) || pending !== null} onClick={() => markScore(action, "correct")}>
                    Mark Score
                  </button>
                  <button className="secondary" disabled={Boolean(endedAt) || pending !== null} onClick={() => markScore(action, "delayed")}>
                    Delayed
                  </button>
                  <button className="secondary" disabled={Boolean(endedAt) || pending !== null} onClick={() => markScore(action, "missed")}>
                    Missed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
