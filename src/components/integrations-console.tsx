"use client";

import { useState } from "react";

const DEFAULT_PROVIDERS = ["CRM", "Helpdesk", "Email", "Billing", "Accounting", "Project Management"];

type IntegrationRow = {
  id: string;
  provider: string;
  status: string;
  connected_at: string | null;
  updated_at: string;
};

export function IntegrationsConsole({ initialRows }: { initialRows: IntegrationRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [provider, setProvider] = useState(DEFAULT_PROVIDERS[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectProvider() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, config: { connected_by: "ui" } })
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Connection failed.");
      }

      const refreshed = await fetch("/api/integrations");
      const refreshedBody = (await refreshed.json()) as { integrations?: IntegrationRow[] };
      setRows(refreshedBody.integrations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="shell-grid">
      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Connect integration</div>
          <h2 style={{ margin: 0 }}>Integration controls</h2>
        </div>
        <div className="grid two">
          <div className="field">
            <label htmlFor="provider">Provider</label>
            <select id="provider" value={provider} onChange={(event) => setProvider(event.target.value)}>
              {DEFAULT_PROVIDERS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        {error ? <div className="badge danger">{error}</div> : null}
        <div>
          <button disabled={pending} onClick={connectProvider}>
            {pending ? "Connecting..." : "Connect"}
          </button>
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Current integrations</div>
          <h2 style={{ margin: 0 }}>Status overview</h2>
        </div>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Status</th>
                <th>Connected</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.provider}</td>
                    <td>{row.status}</td>
                    <td>{row.connected_at ? new Date(row.connected_at).toLocaleString() : "-"}</td>
                    <td>{new Date(row.updated_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No integrations connected yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
