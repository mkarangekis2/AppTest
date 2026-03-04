"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConopAnalysisOutput, LaneType, TrainingLevel } from "@/lib/domain";
import { listLaneTypes } from "@/lib/action-sets";
import { generateRandomConop, listTrainingLevels } from "@/lib/conop-generator";
import { getTrainingCapabilityProfile } from "@/lib/training-scope";

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
  const laneTypes = listLaneTypes();
  const trainingLevels = listTrainingLevels();
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [laneType, setLaneType] = useState(laneTypes[0]?.laneType || "point-of-injury");
  const [trainingLevel, setTrainingLevel] = useState<TrainingLevel>("ranger-first-responder");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState("");
  const [objective, setObjective] = useState("");
  const [metadataText, setMetadataText] = useState("{\n  \"weather\": \"\",\n  \"enemy_posture\": \"\",\n  \"notes\": \"\"\n}");
  const [conop, setConop] = useState<SaveConopResponse["conop"] | null>(null);
  const [analysis, setAnalysis] = useState<ConopAnalysisOutput | null>(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | "analyze" | "scenario" | null>(null);

  function randomizeConop() {
    const generated = generateRandomConop(trainingLevel);
    setTitle(generated.title);
    setRawText(generated.rawText);
    setLaneType(generated.laneType);
    setUnit(generated.unit);
    setLocation(generated.location);
    setObjective(generated.objective);
    setMetadataText(JSON.stringify(generated.metadata, null, 2));
    setConop(null);
    setAnalysis(null);
    setSelected(0);
    setError(null);
  }

  async function saveConop() {
    setPending("save");
    setError(null);
    try {
      const capability = getTrainingCapabilityProfile(trainingLevel);
      const metadata = {
        lane_type: laneType,
        training_level: trainingLevel,
        training_level_label: capability.label,
        authority_summary: capability.authoritySummary,
        within_scope: {
          circulation: capability.circulation,
          airway: capability.airway,
          breathing: capability.breathing
        },
        not_within_scope: capability.notWithinScope,
        supervision_rules: capability.supervisionRules,
        medical_assets: capability.medicalAssets,
        unit,
        location,
        training_objective: objective,
        ...(JSON.parse(metadataText) as Record<string, unknown>)
      } as Record<string, unknown>;
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
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Planning surface</span>
          <span className="badge">{trainingLevels.find((level) => level.value === trainingLevel)?.label}</span>
          <span className="badge ghost">{laneTypes.find((lane) => lane.laneType === laneType)?.name}</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">CONOP Ingestion</div>
          <h1 className="display-title" style={{ margin: 0 }}>Build the mission brief that drives the casualty lane</h1>
        </div>
        <p className="lede">
          Capture operational context, define authority level, and generate a realistic training lane before asking the
          AI to analyze the mission.
        </p>
        <div className="hero-actions">
          <button className="secondary" type="button" onClick={randomizeConop} disabled={pending !== null}>
            Randomized CONOP
          </button>
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
      </section>

      <section className="packet-grid two">
        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Lane Configuration</div>
            <h2 style={{ margin: 0 }}>Operational setup</h2>
          </div>
          <div className="grid two">
            <div className="field">
              <label htmlFor="training-level">Training Level</label>
              <select
                id="training-level"
                value={trainingLevel}
                onChange={(event) => setTrainingLevel(event.target.value as TrainingLevel)}
              >
                {trainingLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="lane-type">Lane Type</label>
              <select id="lane-type" value={laneType} onChange={(event) => setLaneType(event.target.value as LaneType)}>
                {laneTypes.map((lane) => (
                  <option key={lane.laneType} value={lane.laneType}>
                    {lane.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="packet-block emphasis">
            <div className="eyebrow">Generated lane focus</div>
            <ul className="list-tight">
              {(trainingLevels.find((level) => level.value === trainingLevel)?.focus || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="packet-block">
            <div className="eyebrow">Action set emphasis</div>
            <ul className="list-tight">
              {(laneTypes.find((lane) => lane.laneType === laneType)?.emphasis || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="grid two">
            <div className="field">
              <label htmlFor="conop-unit">Unit</label>
              <input id="conop-unit" value={unit} onChange={(event) => setUnit(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="conop-location">Location</label>
              <input id="conop-location" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="conop-objective">Training Objective</label>
            <input id="conop-objective" value={objective} onChange={(event) => setObjective(event.target.value)} />
          </div>
        </div>

        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Readiness</div>
            <h2 style={{ margin: 0 }}>Analysis status and missing steps</h2>
          </div>
          <div className={`status-panel ${conop ? "stable" : "worsening"}`}>
            <div className="badge-row">
              <span className={`badge ${conop ? "" : "warning"}`}>{conop ? "CONOP saved" : "Draft only"}</span>
              <span className={`badge ${analysis ? "" : "ghost"}`}>{analysis ? "Analysis ready" : "No AI analysis yet"}</span>
            </div>
            <div className="muted">
              {conop
                ? "Saved mission details are ready for scenario analysis."
                : "Save first to persist the CONOP and unlock AI analysis."}
            </div>
            {!conop ? (
              <div className="empty-state">
                Use Randomized CONOP to seed a realistic Ranger platoon mission with role-specific assets and treatment
                expectations, or author your own mission brief manually.
              </div>
            ) : null}
            {error ? <div className="badge danger">{error}</div> : null}
          </div>
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-label">Training level</div>
              <div className="metric-value" style={{ fontSize: "1.05rem" }}>
                {trainingLevels.find((level) => level.value === trainingLevel)?.label}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Lane type</div>
              <div className="metric-value" style={{ fontSize: "1.05rem" }}>
                {laneTypes.find((lane) => lane.laneType === laneType)?.name}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Scenario candidates</div>
              <div className="metric-value">{analysis?.scenario_candidates.length || 0}</div>
            </div>
          </div>
          <div className="packet-block">
            <div className="eyebrow">What the AI will use</div>
            <ul className="list-tight">
              <li>Mission narrative and objective</li>
              <li>Training level authority and scope metadata</li>
              <li>Lane type, assets, and environmental details</li>
              <li>Additional metadata JSON for realism and constraints</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Mission brief</div>
          <h2 style={{ margin: 0 }}>Draft the CONOP and supporting metadata</h2>
        </div>
        <div className="field">
          <label htmlFor="conop-title">Title</label>
          <input id="conop-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="conop-text">Raw CONOP</label>
          <textarea id="conop-text" value={rawText} onChange={(event) => setRawText(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="conop-metadata">Additional Metadata JSON</label>
          <textarea id="conop-metadata" value={metadataText} onChange={(event) => setMetadataText(event.target.value)} />
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Scenario candidates</div>
          <h2 style={{ margin: 0 }}>Select the packet you want to save as a draft</h2>
        </div>
        {!analysis ? (
          <div className="empty-state">No analysis yet. Use Analyze CONOP to generate candidate scenario packets.</div>
        ) : (
          <>
            <div className="status-panel stable">
              <div className="eyebrow">AI summary</div>
              <div>{analysis.conop_summary}</div>
            </div>
            <div className="stack">
              {analysis.scenario_candidates.map((candidate, index) => (
                <label
                  key={`${candidate.scenario_name}-${index}`}
                  className="command-card"
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      type="radio"
                      checked={selected === index}
                      onChange={() => setSelected(index)}
                      name="scenario-candidate"
                    />
                    <strong>{candidate.scenario_name}</strong>
                    <span className="badge">{candidate.difficulty}</span>
                    <span className="badge ghost">{candidate.vitals_model.stage}</span>
                  </div>
                  <div className="muted">{candidate.moi}</div>
                  <div className="badge-row">
                    <span className="badge info">{analysis.operational_context.medic_action_set_name || "Action set"}</span>
                    {(analysis.operational_context.medic_action_set || []).slice(0, 3).map((action) => (
                      <span key={action} className="badge ghost">{action}</span>
                    ))}
                  </div>
                  <div className="packet-block">
                    <div className="eyebrow">Opening cue</div>
                    <div>{candidate.patient_presentation.script_opening_line}</div>
                  </div>
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
