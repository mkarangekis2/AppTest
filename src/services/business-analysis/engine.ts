import { BusinessAnalysis, OnboardingPayload } from "@/lib/acg/types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function generateBusinessAnalysis(input: OnboardingPayload): BusinessAnalysis {
  const leadHandling = clampScore(
    65 -
      (input.leadVolume >= 60 ? 15 : 0) -
      (input.painPoints.includes("slow_lead_response") ? 20 : 0) +
      (input.workflowMaturity === "high" ? 10 : 0)
  );
  const documentation = clampScore(
    (input.documentationMaturity === "high" ? 85 : input.documentationMaturity === "medium" ? 60 : 35) -
      (input.painPoints.includes("tribal_knowledge") ? 10 : 0)
  );
  const serviceDelivery = clampScore(
    70 -
      (input.supportComplexity === "high" ? 20 : input.supportComplexity === "medium" ? 10 : 0) -
      (input.projectComplexity === "high" ? 10 : 0)
  );
  const automationPotential = clampScore(
    40 +
      (input.workflowMaturity === "low" ? 35 : input.workflowMaturity === "medium" ? 20 : 10) +
      (input.painPoints.includes("manual_admin") ? 15 : 0)
  );
  const revenueLeakageRisk = clampScore(
    25 +
      (input.leadVolume >= 50 ? 20 : 0) +
      (input.painPoints.includes("missed_followups") ? 25 : 0) +
      (input.painPoints.includes("stale_quotes") ? 20 : 0)
  );
  const executiveVisibility = clampScore(
    75 -
      (input.workflowMaturity === "low" ? 25 : input.workflowMaturity === "medium" ? 10 : 0) -
      (input.documentationMaturity === "low" ? 10 : 0)
  );

  const riskAreas: string[] = [];
  if (leadHandling < 55) riskAreas.push("Lead handling latency and follow-up coverage");
  if (documentation < 55) riskAreas.push("SOP/documentation quality and handoff consistency");
  if (serviceDelivery < 55) riskAreas.push("Service execution consistency under workload");
  if (revenueLeakageRisk > 60) riskAreas.push("Revenue leakage risk from unclosed or stale opportunities");

  const opportunities: string[] = [];
  if (automationPotential > 60) opportunities.push("Automate repetitive operational workflows");
  if (executiveVisibility < 65) opportunities.push("Introduce leadership KPI command center");
  if (input.supportVolume > 30) opportunities.push("Deploy support triage and SLA risk alerts");

  const prioritizedPainPoints = [...input.painPoints].slice(0, 4);
  const summary =
    "Operational diagnostic indicates immediate value in workflow standardization, response-speed automation, and tighter executive visibility.";

  return {
    summary,
    prioritizedPainPoints,
    scores: {
      leadHandling,
      documentation,
      serviceDelivery,
      automationPotential,
      revenueLeakageRisk,
      executiveVisibility
    },
    opportunities,
    riskAreas
  };
}
