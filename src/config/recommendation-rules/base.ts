import { OnboardingPayload } from "@/lib/acg/types";

export type RecommendationRule = {
  id: string;
  when: (input: OnboardingPayload) => boolean;
  recommendModuleSlugs?: string[];
  recommendPackageSlugs?: string[];
  reason: (input: OnboardingPayload) => string;
  impact: "low" | "medium" | "high";
};

export const BASE_RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: "high-lead-volume",
    when: (input) => input.leadVolume >= 50,
    recommendModuleSlugs: ["lead-capture-automation", "lead-qualification-ai", "follow-up-automation"],
    recommendPackageSlugs: ["lead-conversion-improvement-package"],
    reason: (input) =>
      `Lead volume is ${input.leadVolume}/month, which indicates response and follow-up automation will reduce pipeline leakage.`,
    impact: "high"
  },
  {
    id: "low-documentation",
    when: (input) => input.documentationMaturity === "low",
    recommendModuleSlugs: ["sop-builder", "knowledge-base-creator"],
    recommendPackageSlugs: ["documentation-and-knowledge-package"],
    reason: () => "Documentation maturity is low; SOP standardization will reduce execution variance.",
    impact: "medium"
  },
  {
    id: "support-pressure",
    when: (input) => input.supportVolume >= 40 || input.supportComplexity === "high",
    recommendModuleSlugs: ["support-ticket-triage", "sla-risk-alerts", "customer-sentiment-detection"],
    recommendPackageSlugs: ["service-delivery-consistency-package"],
    reason: (input) =>
      `Support load (${input.supportVolume}/month) and complexity indicate triage automation should be prioritized.`,
    impact: "high"
  },
  {
    id: "owner-visibility-gap",
    when: (input) => input.workflowMaturity !== "high",
    recommendModuleSlugs: ["executive-intelligence-dashboard", "operations-dashboard"],
    recommendPackageSlugs: ["executive-visibility-package"],
    reason: () => "Workflow maturity is not yet high; leadership visibility should be centralized.",
    impact: "medium"
  },
  {
    id: "manual-admin-burden",
    when: (input) => input.painPoints.includes("manual_admin"),
    recommendModuleSlugs: ["task-routing-engine", "workflow-optimization", "project-status-reports"],
    recommendPackageSlugs: ["operations-efficiency-package"],
    reason: () => "Manual admin burden is elevated, so workflow automation and routing should be prioritized.",
    impact: "high"
  },
  {
    id: "revenue-leakage-signals",
    when: (input) => input.painPoints.includes("stale_quotes") || input.painPoints.includes("missed_followups"),
    recommendModuleSlugs: ["revenue-leak-detection", "quote-follow-up-automation"],
    recommendPackageSlugs: ["revenue-growth-package"],
    reason: () => "Stale quotes and follow-up leakage indicate direct revenue recovery opportunity.",
    impact: "high"
  }
];
