"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScenarioActions({ scenarioId, status }: { scenarioId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "start" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setPending("approve");
    setError(null);
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/approve`, { method: "POST" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Approval failed.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setPending(null);
    }
  }

  async function startSession() {
    setPending("start");
    setError(null);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, mode: "exam" })
      });
      const payload = (await response.json()) as { sessionId?: string; error?: string };
      if (!response.ok || !payload.sessionId) {
        throw new Error(payload.error || "Session start failed.");
      }
      router.push(`/sessions/${payload.sessionId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session start failed.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="stack" style={{ justifyItems: "end" }}>
      {status !== "approved" ? (
        <button onClick={approve} disabled={pending !== null}>
          {pending === "approve" ? "Approving..." : "Approve Scenario"}
        </button>
      ) : (
        <button onClick={startSession} disabled={pending !== null}>
          {pending === "start" ? "Starting..." : "Start Session"}
        </button>
      )}
      {status === "approved" ? <div className="muted">Approval locks the saved scenario package for live use.</div> : null}
      {error ? <div className="muted">{error}</div> : null}
    </div>
  );
}
