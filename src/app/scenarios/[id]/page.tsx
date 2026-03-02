import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ScenarioActions } from "@/components/scenario-actions";

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

  return (
    <div className="stack">
      <section className="card stack">
        <div className="eyebrow">Scenario</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div className="stack">
            <h1 style={{ margin: 0 }}>{scenario.name}</h1>
            <div className="muted">
              {scenario.status} · {scenario.difficulty}
            </div>
          </div>
          <ScenarioActions scenarioId={scenario.id} status={scenario.status} />
        </div>
        <div className="grid two">
          <div className="panel stack">
            <div className="eyebrow">Mechanism / Context</div>
            <div>{scenario.moi}</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(scenario.environment_json, null, 2)}</pre>
          </div>
          <div className="panel stack">
            <div className="eyebrow">Presentation</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(scenario.presentation_script_json, null, 2)}
            </pre>
          </div>
        </div>
        <div className="grid two">
          <div className="panel stack">
            <div className="eyebrow">Wound Set</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(scenario.wound_set_json, null, 2)}</pre>
          </div>
          <div className="panel stack">
            <div className="eyebrow">Rubric / Vitals</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(scenario.rubric_json, null, 2)}</pre>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(scenario.vitals_model_json, null, 2)}</pre>
          </div>
        </div>
        <Link href="/">Back to dashboard</Link>
      </section>
    </div>
  );
}
