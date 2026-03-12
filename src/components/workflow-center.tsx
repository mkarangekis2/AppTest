"use client";

import { useState } from "react";
import { EmptyState, Notice } from "@/components/ui/feedback";

type Workflow = {
  id: string;
  name: string;
  status: string;
  trigger_type: string;
  version: number;
  updated_at: string;
};

export function WorkflowCenter({ initialWorkflows }: { initialWorkflows: Workflow[] }) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("LeadCreated");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createWorkflow() {
    setPending("create");
    setError(null);
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          triggerType,
          status: "draft",
          definition: { trigger: triggerType, conditions: [], actions: [] }
        })
      });
      const body = (await response.json()) as { workflow?: Workflow; error?: string };
      if (!response.ok || !body.workflow) {
        throw new Error(body.error || "Failed to create workflow.");
      }
      setWorkflows((prev) => [body.workflow!, ...prev]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow.");
    } finally {
      setPending(null);
    }
  }

  async function runWorkflow(workflowId: string) {
    setPending(workflowId);
    setError(null);
    try {
      const response = await fetch("/api/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId })
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Run failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="shell-grid">
      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Create workflow</div>
          <h2 style={{ margin: 0 }}>Trigger to Conditions to Actions scaffold</h2>
        </div>
        <div className="grid two">
          <div className="field">
            <label htmlFor="wf-name">Workflow name</label>
            <input id="wf-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Lead qualification follow-up" />
          </div>
          <div className="field">
            <label htmlFor="wf-trigger">Trigger type</label>
            <select id="wf-trigger" value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
              <option>LeadCreated</option>
              <option>FormSubmitted</option>
              <option>EmailReceived</option>
              <option>TicketCreated</option>
              <option>OpportunityStalled</option>
              <option>ClientOnboarded</option>
              <option>DocumentUploaded</option>
              <option>TaskOverdue</option>
              <option>RenewalApproaching</option>
              <option>ProjectDelayed</option>
            </select>
          </div>
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <div>
          <button disabled={!name.trim() || pending !== null} onClick={createWorkflow}>
            {pending === "create" ? "Creating..." : "Create workflow"}
          </button>
        </div>
      </section>

      <section className="grid two">
        {workflows.map((workflow) => (
          <article key={workflow.id} className="card stack">
            <div className="badge-row">
              <span className="badge">{workflow.status}</span>
              <span className="badge ghost">{workflow.trigger_type}</span>
              <span className="badge info">v{workflow.version}</span>
            </div>
            <h3 style={{ margin: 0 }}>{workflow.name}</h3>
            <div className="muted">Updated {new Date(workflow.updated_at).toLocaleString()}</div>
            <div>
              <button className="secondary" disabled={pending !== null} onClick={() => runWorkflow(workflow.id)}>
                {pending === workflow.id ? "Running..." : "Run workflow"}
              </button>
            </div>
          </article>
        ))}
        {!workflows.length ? <EmptyState title="No workflows yet" detail="Create your first workflow to activate automation." /> : null}
      </section>
    </div>
  );
}
