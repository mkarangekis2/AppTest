"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

type Level = "low" | "medium" | "high";

const PAIN_POINTS = [
  { key: "slow_lead_response", label: "Slow lead response" },
  { key: "missed_followups", label: "Missed follow-ups" },
  { key: "manual_admin", label: "Manual admin burden" },
  { key: "tribal_knowledge", label: "Tribal knowledge concentration" },
  { key: "stale_quotes", label: "Stale quotes/proposals" }
];

const GROWTH_GOALS = [
  { key: "improve_conversion", label: "Improve conversion rate" },
  { key: "increase_delivery_capacity", label: "Increase delivery capacity" },
  { key: "standardize_operations", label: "Standardize operations" },
  { key: "improve_visibility", label: "Improve executive visibility" }
];

export function OnboardingWizard() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("Professional Services");
  const [teamSize, setTeamSize] = useState("5-20");
  const [revenueModel, setRevenueModel] = useState("Recurring services");

  const [leadVolume, setLeadVolume] = useState(25);
  const [supportVolume, setSupportVolume] = useState(20);
  const [documentationMaturity, setDocumentationMaturity] = useState<Level>("medium");
  const [workflowMaturity, setWorkflowMaturity] = useState<Level>("medium");
  const [projectComplexity, setProjectComplexity] = useState<Level>("medium");
  const [supportComplexity, setSupportComplexity] = useState<Level>("medium");

  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [growthGoals, setGrowthGoals] = useState<string[]>([]);

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          website,
          industry,
          teamSize,
          revenueModel,
          leadVolume,
          supportVolume,
          documentationMaturity,
          workflowMaturity,
          projectComplexity,
          supportComplexity,
          painPoints,
          growthGoals,
          answers: [
            { questionKey: "industry", answer: industry },
            { questionKey: "team_size", answer: teamSize },
            { questionKey: "revenue_model", answer: revenueModel },
            { questionKey: "pain_points", answer: painPoints },
            { questionKey: "growth_goals", answer: growthGoals }
          ]
        })
      });

      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Onboarding save failed.");
      }

      router.push("/analysis" as Route);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding save failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="shell-grid">
      <section className="hero card mission-hero">
        <div className="badge-row">
          <span className="badge info">Step {step} of 3</span>
          <span className="badge">Business diagnostic</span>
        </div>
        <div className="section-heading">
          <div className="eyebrow">Onboarding</div>
          <h1 className="display-title" style={{ margin: 0 }}>
            Analyze your operations profile
          </h1>
        </div>
        <p className="lede">
          Complete the diagnostic so the platform can generate explainable analysis and prioritized system recommendations.
        </p>
      </section>

      {step === 1 ? (
        <section className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Business profile</div>
            <h2 style={{ margin: 0 }}>Company and market context</h2>
          </div>
          <div className="grid two">
            <div className="field">
              <label>Company name</label>
              <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required />
            </div>
            <div className="field">
              <label>Website</label>
              <input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" />
            </div>
            <div className="field">
              <label>Industry</label>
              <input value={industry} onChange={(event) => setIndustry(event.target.value)} />
            </div>
            <div className="field">
              <label>Team size</label>
              <select value={teamSize} onChange={(event) => setTeamSize(event.target.value)}>
                <option>1-5</option>
                <option>5-20</option>
                <option>20-50</option>
                <option>50+</option>
              </select>
            </div>
            <div className="field">
              <label>Revenue model</label>
              <input value={revenueModel} onChange={(event) => setRevenueModel(event.target.value)} />
            </div>
          </div>
          <div className="action-row">
            <button className="secondary" disabled={!companyName.trim()} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Operating volume and maturity</div>
            <h2 style={{ margin: 0 }}>How the business currently runs</h2>
          </div>
          <div className="grid two">
            <div className="field">
              <label>Lead volume / month</label>
              <input
                type="number"
                min={0}
                value={leadVolume}
                onChange={(event) => setLeadVolume(Number(event.target.value || 0))}
              />
            </div>
            <div className="field">
              <label>Support volume / month</label>
              <input
                type="number"
                min={0}
                value={supportVolume}
                onChange={(event) => setSupportVolume(Number(event.target.value || 0))}
              />
            </div>
            <SelectLevel label="Documentation maturity" value={documentationMaturity} onChange={setDocumentationMaturity} />
            <SelectLevel label="Workflow maturity" value={workflowMaturity} onChange={setWorkflowMaturity} />
            <SelectLevel label="Project complexity" value={projectComplexity} onChange={setProjectComplexity} />
            <SelectLevel label="Support complexity" value={supportComplexity} onChange={setSupportComplexity} />
          </div>
          <div className="action-row">
            <button className="secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="secondary" onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="card stack">
          <div className="section-heading">
            <div className="eyebrow">Pain points and growth goals</div>
            <h2 style={{ margin: 0 }}>Priorities for recommendations</h2>
          </div>
          <div className="grid two">
            <div className="packet-block">
              <div className="eyebrow">Pain points</div>
              <div className="stack tight">
                {PAIN_POINTS.map((item) => (
                  <label key={item.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={painPoints.includes(item.key)}
                      onChange={() => toggle(painPoints, item.key, setPainPoints)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="packet-block">
              <div className="eyebrow">Growth goals</div>
              <div className="stack tight">
                {GROWTH_GOALS.map((item) => (
                  <label key={item.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={growthGoals.includes(item.key)}
                      onChange={() => toggle(growthGoals, item.key, setGrowthGoals)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {error ? <div className="badge danger">{error}</div> : null}
          <div className="action-row">
            <button className="secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button disabled={pending || !companyName.trim()} onClick={submit}>
              {pending ? "Saving..." : "Generate Analysis"}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SelectLevel({
  label,
  value,
  onChange
}: {
  label: string;
  value: Level;
  onChange: (next: Level) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value as Level)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}
