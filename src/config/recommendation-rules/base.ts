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
    recommendModuleSlugs: ["lead-capture-automation", "follow-up-automation"],
    recommendPackageSlugs: ["lead-conversion-improvement"],
    reason: (input) =>
      `Lead volume is ${input.leadVolume}/month, which indicates response and follow-up automation will reduce pipeline leakage.`,
    impact: "high"
  },
  {
    id: "low-documentation",
    when: (input) => input.documentationMaturity === "low",
    recommendModuleSlugs: ["sop-builder"],
    recommendPackageSlugs: ["documentation-and-knowledge"],
    reason: () => "Documentation maturity is low; SOP standardization will reduce execution variance.",
    impact: "medium"
  },
  {
    id: "support-pressure",
    when: (input) => input.supportVolume >= 40 || input.supportComplexity === "high",
    recommendModuleSlugs: ["support-ticket-triage"],
    reason: (input) =>
      `Support load (${input.supportVolume}/month) and complexity indicate triage automation should be prioritized.`,
    impact: "high"
  },
  {
    id: "owner-visibility-gap",
    when: (input) => input.workflowMaturity !== "high",
    recommendModuleSlugs: ["executive-intelligence-dashboard"],
    recommendPackageSlugs: ["executive-visibility"],
    reason: () => "Workflow maturity is not yet high; leadership visibility should be centralized.",
    impact: "medium"
  }
];
