import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ScenarioActions } from "@/components/scenario-actions";
import { TcccBodyMap } from "@/components/tccc-body-map";
import { buildQuestionPrompts, buildTreatmentCards, compactVitalsDelta, summarizeMission } from "@/lib/scenario-format";

export default async function ScenarioPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireUser();
  const { data: scenario } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!scenario) {
    notFound();
  }

  const mission = summarizeMission(scenario.environment_json, scenario.moi);
  const treatmentCards = buildTreatmentCards(scenario);
  const presentation = scenario.presentation_script_json as {
    demeanor?: string;
    behavior_cues?: string[];
    chief_complaint?: string;
    script_opening_line?: string;
  };
  const woundSet = scenario.wound_set_json as {
    injuries?: Array<{
      label: string;
      region: string;
      type: string;
      severity: string;
      visible_findings: string[];
      hidden_findings: string[];
      expected_interventions: string[];
      critical_errors: string[];
    }>;
  };
  const rubric = scenario.rubric_json as {
    critical_actions?: Array<{ action: string; must_occur_by_sec: number; fail_if_missed: boolean; notes: string }>;
    scoring_dimensions?: Array<{ name: string; max_points: number; notes: string }>;
  };
  const vitalsModel = scenario.vitals_model_json as {
    stage?: string;
    baseline?: { hr: number; rr: number; spo2: number; bp_sys: number; bp_dia: number; temp_c: number; pain_0_10: number };
  };
  const prompts = buildQuestionPrompts(scenario.presentation_script_json);

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge">{scenario.status}</span>
          <span className="badge info">{scenario.difficulty}</span>
          <span className="badge ghost">{mission.setting}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="stack" style={{ maxWidth: 760 }}>
            <div className="section-heading">
              <div className="eyebrow">Scenario packet</div>
              <h1 className="display-title" style={{ margin: 0 }}>{scenario.name}</h1>
            </div>
            <div className="lede">{mission.missionBrief}</div>
          </div>
          <ScenarioActions scenarioId={scenario.id} status={scenario.status} />
        </div>
      </section>

      <section className="packet-grid two">
        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Mission set</div>
            <h2 style={{ margin: 0 }}>Operational framing and lane constraints</h2>
          </div>
          <div className="packet-block emphasis">
            <strong>Scenario situation</strong>
            <div>{scenario.moi}</div>
            <div className="badge-row">
              <span className="badge">{mission.setting}</span>
              <span className={`badge ${mission.pressure === "high" ? "warning" : mission.pressure === "low" ? "" : "info"}`}>
                Time pressure: {mission.pressure}
              </span>
            </div>
          </div>
          <div className="packet-block">
            <strong>Available resources</strong>
            <div className="badge-row">
              {mission.resources.length ? mission.resources.map((resource) => <span key={resource} className="badge">{resource}</span>) : <span className="muted">No resources authored.</span>}
            </div>
          </div>
          <div className="packet-block">
            <strong>Lane constraints</strong>
            <ul className="list-tight">
              {mission.constraints.length ? mission.constraints.map((constraint) => <li key={constraint}>{constraint}</li>) : <li>No constraints authored.</li>}
            </ul>
          </div>
        </div>

        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Proctor script</div>
            <h2 style={{ margin: 0 }}>Role-player cues and verbal responses</h2>
          </div>
          <div className="packet-block emphasis">
            <strong>Patient demeanor</strong>
            <div>{presentation.demeanor || "No demeanor authored."}</div>
            <strong>Opening line</strong>
            <div>&ldquo;{presentation.script_opening_line || "No opening line authored."}&rdquo;</div>
          </div>
          <div className="packet-block">
            <strong>Behavior cues</strong>
            <ul className="list-tight">
              {(presentation.behavior_cues || []).map((cue) => <li key={cue}>{cue}</li>)}
            </ul>
          </div>
          <div className="stack">
            {prompts.map((prompt) => (
              <div key={prompt.label} className="packet-block">
                <div className="eyebrow">{prompt.label}</div>
                <div>{prompt.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="packet-grid two">
        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Casualty findings</div>
            <h2 style={{ margin: 0 }}>What the proctor should present and watch for</h2>
          </div>
          <TcccBodyMap injuries={woundSet.injuries || []} />
          <div className="stack">
            {(woundSet.injuries || []).map((injury) => (
              <div key={injury.label} className="command-card active">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{injury.label}</strong>
                  <span className={`badge ${injury.severity === "severe" ? "danger" : injury.severity === "moderate" ? "warning" : ""}`}>{injury.severity}</span>
                </div>
                <div className="muted">{injury.region} · {injury.type}</div>
                <strong>Visible findings</strong>
                <ul className="list-tight">
                  {injury.visible_findings.map((finding) => <li key={finding}>{finding}</li>)}
                </ul>
                <strong>Hidden findings</strong>
                <ul className="list-tight">
                  {injury.hidden_findings.map((finding) => <li key={finding}>{finding}</li>)}
                </ul>
                <strong>Key treatments</strong>
                <div className="badge-row">
                  {injury.expected_interventions.map((item) => <span key={item} className="badge">{item}</span>)}
                </div>
                <strong>Common critical errors</strong>
                <ul className="list-tight">
                  {injury.critical_errors.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Rubric and patient state</div>
            <h2 style={{ margin: 0 }}>Baseline condition and evaluation logic</h2>
          </div>
          <div className={`status-panel ${vitalsModel.stage || "worsening"}`}>
            <strong>Baseline patient state</strong>
            <div className="badge-row">
              <span className="badge">{vitalsModel.stage || "unknown"} stage</span>
              <span className="badge ghost">Rubric-backed lane timing</span>
            </div>
            <div className="table">
              <table>
                <tbody>
                  <tr><th>HR</th><td>{vitalsModel.baseline?.hr ?? "-"}</td><th>RR</th><td>{vitalsModel.baseline?.rr ?? "-"}</td></tr>
                  <tr><th>SpO2</th><td>{vitalsModel.baseline?.spo2 ?? "-"}</td><th>BP</th><td>{vitalsModel.baseline ? `${vitalsModel.baseline.bp_sys}/${vitalsModel.baseline.bp_dia}` : "-"}</td></tr>
                  <tr><th>Temp C</th><td>{vitalsModel.baseline?.temp_c ?? "-"}</td><th>Pain</th><td>{vitalsModel.baseline?.pain_0_10 ?? "-"}/10</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="stack">
            {(rubric.critical_actions || []).map((item) => (
              <div key={item.action} className="packet-block">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{item.action}</strong>
                  <span className="badge">by {item.must_occur_by_sec}s</span>
                </div>
                <div>{item.notes}</div>
                <div className="muted">{item.fail_if_missed ? "Critical fail if missed." : "Scored but not automatic fail."}</div>
              </div>
            ))}
          </div>
          <div className="packet-block">
            <strong>Scoring dimensions</strong>
            <ul className="list-tight">
              {(rubric.scoring_dimensions || []).map((dimension) => (
                <li key={dimension.name}>
                  {dimension.name} ({dimension.max_points} pts): {dimension.notes}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="section-heading">
          <div className="eyebrow">Treatment outcomes</div>
          <h2 style={{ margin: 0 }}>Action-by-action lane consequences</h2>
        </div>
        <div className="grid two">
          {treatmentCards.map((card) => (
            <div key={card.action} className="command-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{card.action}</strong>
                {card.deadlineSec !== null ? <span className="badge">Due {card.deadlineSec}s</span> : null}
              </div>
              <div>{card.reason}</div>
              {card.visibleCues.length ? (
                <>
                  <strong>What cues justify it</strong>
                  <ul className="list-tight">
                    {card.visibleCues.map((cue) => <li key={cue}>{cue}</li>)}
                  </ul>
                </>
              ) : null}
              <div className="grid two">
                <div className="packet-block">
                  <div className="eyebrow">If done</div>
                  <ul className="list-tight">
                    {card.ifDone.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="packet-block">
                  <div className="eyebrow">If delayed or missed</div>
                  <ul className="list-tight">
                    {card.ifMissed.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
              <strong>Authored state changes</strong>
              <ul className="list-tight">
                {card.stageEffects.length ? card.stageEffects.map((effect) => (
                  <li key={`${card.action}-${effect.label}-${effect.toStage}`}>
                    {effect.label}: {effect.toStage} in {effect.timeWindowSec}s. {effect.notes} {compactVitalsDelta(effect.delta)}
                  </li>
                )) : <li>No authored state change for this treatment.</li>}
              </ul>
            </div>
          ))}
        </div>
        <Link className="nav-link" href="/">Back to dashboard</Link>
      </section>
    </div>
  );
}
