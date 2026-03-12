"use client";

import { useState } from "react";

type SettingsPayload = {
  companyName: string;
  website: string;
  brandVoice: string;
  aiMode: string;
};

export function SettingsConsole({
  initialCompanyName,
  initialWebsite
}: {
  initialCompanyName: string;
  initialWebsite: string;
}) {
  const [state, setState] = useState<SettingsPayload>({
    companyName: initialCompanyName,
    website: initialWebsite,
    brandVoice: "professional, concise, trusted",
    aiMode: "balanced"
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: state.companyName,
          website: state.website,
          brandVoice: { tone: state.brandVoice },
          aiBehavior: { mode: state.aiMode },
          notifications: { daily_digest: true }
        })
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Save failed.");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card stack">
      <div className="section-heading">
        <div className="eyebrow">Settings</div>
        <h2 style={{ margin: 0 }}>Company and AI behavior controls</h2>
      </div>
      <div className="grid two">
        <div className="field">
          <label htmlFor="companyName">Company name</label>
          <input
            id="companyName"
            value={state.companyName}
            onChange={(event) => setState((prev) => ({ ...prev, companyName: event.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            value={state.website}
            onChange={(event) => setState((prev) => ({ ...prev, website: event.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="brandVoice">Brand voice</label>
          <input
            id="brandVoice"
            value={state.brandVoice}
            onChange={(event) => setState((prev) => ({ ...prev, brandVoice: event.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="aiMode">AI mode</label>
          <select
            id="aiMode"
            value={state.aiMode}
            onChange={(event) => setState((prev) => ({ ...prev, aiMode: event.target.value }))}
          >
            <option value="balanced">Balanced</option>
            <option value="conservative">Conservative</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
      </div>
      {error ? <div className="badge danger">{error}</div> : null}
      {saved ? <div className="badge info">Settings saved.</div> : null}
      <div>
        <button disabled={pending} onClick={save}>
          {pending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </section>
  );
}
