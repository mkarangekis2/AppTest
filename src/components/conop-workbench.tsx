"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConopAnalysisOutput } from "@/lib/domain";

type SaveConopResponse = {
  conop: {
    id: string;
    title: string;
    raw_text: string;
    metadata_json: Record<string, unknown>;
  };
};

export function ConopWorkbench() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [metadataText, setMetadataText] = useState("{\n  \"unit\": \"\",\n  \"location\": \"\",\n  \"training_objective\": \"\"\n}");
  const [conop, setConop] = useState<SaveConopResponse["conop"] | null>(null);
  const [analysis, setAnalysis] = useState<ConopAnalysisOutput | null>(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | "analyze" | "scenario" | null>(null);

  async function saveConop() {
    setPending("save");
    setError(null);
    try {
      const metadata = JSON.parse(metadataText) as Record<string, unknown>;
      const response = await fetch("/api/conops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, rawText, metadata })
      });
      const payload = (await response.json()) as SaveConopResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save CONOP.");
      }
      setConop(payload.conop);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save CONOP.");
    } finally {
      setPending(null);
    }
  }

  async function analyzeConop() {
    if (!conop) {
      setError("Save the CONOP before analysis.");
      return;
    }
    setPending("analyze");
    setError(null);

    try {
      const response = await fetch("/api/ai/analyze-conop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conopId: conop.id })
      });
      const payload = (await response.json()) as ConopAnalysisOutput & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to analyze CONOP.");
      }
      setAnalysis(payload);
      setSelected(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze CONOP.");
    } finally {
      setPending(null);
    }
  }

  async function saveScenarioDraft() {
    if (!conop || !analysis) {
      return;
    }

    setPending("scenario");
    setError(null);

    try {
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conopId: conop.id,
          analysis,
          candidateIndex: selected
        })
      });
      const payload = (await response.json()) as { scenarioId?: string; error?: string };
      if (!response.ok || !payload.scenarioId) {
        throw new Error(payload.error || "Failed to save scenario.");
      }
      router.push(`/scenarios/${payload.scenarioId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save scenario.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="stack">
      <section className="card stack">
        <div className="eyebrow">CONOP Ingestion</div>
        <div className="field">
          <label htmlFor="conop-title">Title</label>
          <input id="conop-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="conop-text">Raw CONOP</label>
          <textarea id="conop-text" value={rawText} onChange={(event) => setRawText(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="conop-metadata">Metadata JSON</label>
          <textarea id="conop-metadata" value={metadataText} onChange={(event) => setMetadataText(event.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={saveConop} disabled={pending !== null || !title || !rawText}>
            {pending === "save" ? "Saving..." : conop ? "Saved" : "Save CONOP"}
          </button>
          <button className="secondary" onClick={analyzeConop} disabled={pending !== null || !conop}>
            {pending === "analyze" ? "Analyzing..." : "Analyze CONOP"}
          </button>
          <button onClick={saveScenarioDraft} disabled={pending !== null || !analysis}>
            {pending === "scenario" ? "Saving draft..." : "Save Scenario Draft"}
          </button>
        </div>
        {error ? <div className="muted">{error}</div> : null}
        {!conop ? <div className="muted">Save first to persist the CONOP and enable analysis.</div> : null}
      </section>

      <section className="card stack">
        <div className="eyebrow">Scenario Candidates</div>
        {!analysis ? (
          <div className="muted">No analysis yet. Use Analyze CONOP to generate scenario candidates.</div>
        ) : (
          <>
            <div className="muted">{analysis.conop_summary}</div>
            <div className="stack">
              {analysis.scenario_candidates.map((candidate, index) => (
                <label
                  key={`${candidate.scenario_name}-${index}`}
                  className="panel"
                  style={{ display: "grid", gap: 10, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="radio"
                      checked={selected === index}
                      onChange={() => setSelected(index)}
                      name="scenario-candidate"
                    />
                    <strong>{candidate.scenario_name}</strong>
                    <span className="badge">{candidate.difficulty}</span>
                  </div>
                  <div className="muted">{candidate.moi}</div>
                  <div>{candidate.patient_presentation.script_opening_line}</div>
                  <div className="muted">{candidate.training_only_disclaimer}</div>
                </label>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
