"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState, Notice, SkeletonRows, TableShell } from "@/components/ui/feedback";

type AppSummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  provider: "openai" | "anthropic";
  model: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type AppRun = {
  id: string;
  status: "pending" | "success" | "error";
  input_json: { prompt?: string };
  output_json?: Record<string, unknown> | null;
  error_text?: string | null;
  latency_ms?: number | null;
  started_at: string;
  finished_at?: string | null;
};

type Props = {
  initialApps: AppSummary[];
};

export function AiAppStudio({ initialApps }: Props) {
  const [apps, setApps] = useState<AppSummary[]>(initialApps);
  const [selectedAppId, setSelectedAppId] = useState<string>(initialApps[0]?.id || "");
  const [runs, setRuns] = useState<AppRun[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [pendingRun, setPendingRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runPrompt, setRunPrompt] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [model, setModel] = useState("gpt-4.1");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an operations assistant for SMB teams. Return JSON with concise actions, risks, and next steps."
  );

  const selectedApp = useMemo(() => apps.find((app) => app.id === selectedAppId) || null, [apps, selectedAppId]);

  useEffect(() => {
    if (!selectedAppId) {
      setRuns([]);
      return;
    }
    void loadRuns(selectedAppId);
  }, [selectedAppId]);

  async function loadRuns(appId: string) {
    setLoadingRuns(true);
    setError(null);
    try {
      const response = await fetch(`/api/apps/${appId}/runs`);
      const payload = (await response.json()) as { runs?: AppRun[]; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to load runs.");
      }
      setRuns(payload.runs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load runs.");
    } finally {
      setLoadingRuns(false);
    }
  }

  async function createApp() {
    setPendingCreate(true);
    setError(null);
    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          provider,
          model,
          systemPrompt
        })
      });
      const payload = (await response.json()) as { app?: AppSummary; error?: string };
      if (!response.ok || !payload.app) {
        throw new Error(payload.error || "Failed to create app.");
      }

      const nextApps = [payload.app, ...apps];
      setApps(nextApps);
      setSelectedAppId(payload.app.id);
      setName("");
      setDescription("");
      setRunPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create app.");
    } finally {
      setPendingCreate(false);
    }
  }

  async function runSelectedApp() {
    if (!selectedApp) {
      return;
    }
    setPendingRun(true);
    setError(null);
    try {
      const response = await fetch(`/api/apps/${selectedApp.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: runPrompt,
          context: {
            source: "ai-app-studio"
          }
        })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to run AI app.");
      }
      setRunPrompt("");
      await loadRuns(selectedApp.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run AI app.");
    } finally {
      setPendingRun(false);
    }
  }

  return (
    <div className="grid two">
      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Create app</div>
          <h2 style={{ margin: 0 }}>Define a reusable AI workflow</h2>
        </div>
        <div className="field">
          <label htmlFor="app-name">App name</label>
          <input id="app-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Support response assistant" />
        </div>
        <div className="field">
          <label htmlFor="app-description">Description</label>
          <textarea
            id="app-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What this app does and who should use it"
          />
        </div>
        <div className="grid two">
          <div className="field">
            <label htmlFor="app-provider">Provider</label>
            <select
              id="app-provider"
              value={provider}
              onChange={(event) => {
                const next = event.target.value as "openai" | "anthropic";
                setProvider(next);
                setModel(next === "openai" ? "gpt-4.1" : "claude-3-7-sonnet-latest");
              }}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="app-model">Model</label>
            <input id="app-model" value={model} onChange={(event) => setModel(event.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="app-system-prompt">System prompt</label>
          <textarea id="app-system-prompt" value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} />
        </div>
        <div className="action-row">
          <button onClick={createApp} disabled={pendingCreate || !name.trim() || !model.trim() || !systemPrompt.trim()}>
            {pendingCreate ? "Creating..." : "Create AI App"}
          </button>
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Run app</div>
          <h2 style={{ margin: 0 }}>Execute and inspect outputs</h2>
        </div>

        <div className="field">
          <label htmlFor="app-select">Select app</label>
          <select id="app-select" value={selectedAppId} onChange={(event) => setSelectedAppId(event.target.value)}>
            {apps.length === 0 ? <option value="">No AI apps created yet</option> : null}
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.provider})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="run-prompt">Run prompt</label>
          <textarea
            id="run-prompt"
            value={runPrompt}
            onChange={(event) => setRunPrompt(event.target.value)}
            placeholder="Enter the business request for this app..."
          />
        </div>

        <div className="action-row">
          <button onClick={runSelectedApp} disabled={!selectedApp || pendingRun || !runPrompt.trim()}>
            {pendingRun ? "Running..." : "Run AI App"}
          </button>
          <button className="secondary" onClick={() => selectedAppId && void loadRuns(selectedAppId)} disabled={!selectedAppId || loadingRuns}>
            {loadingRuns ? "Refreshing..." : "Refresh runs"}
          </button>
        </div>

        {error ? <Notice tone="error">{error}</Notice> : null}

        <TableShell title="Recent app runs" subtitle="Run history">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {loadingRuns ? (
                <tr>
                  <td colSpan={4}>
                    <SkeletonRows rows={4} />
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title="No runs yet for this app" detail="Run a prompt to capture output and latency." />
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id}>
                    <td>{new Date(run.started_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${run.status === "error" ? "danger" : run.status === "pending" ? "warning" : ""}`}>{run.status}</span>
                    </td>
                    <td>{typeof run.latency_ms === "number" ? `${run.latency_ms} ms` : "-"}</td>
                    <td className="muted">
                      {run.status === "error"
                        ? run.error_text || "Execution failed."
                        : JSON.stringify(run.output_json || {}, null, 0).slice(0, 120)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </section>
    </div>
  );
}
