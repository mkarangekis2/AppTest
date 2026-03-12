import { OnboardingPayload } from "@/lib/acg/types";

const ALLOWED_LEVELS = new Set(["low", "medium", "high"]);

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, Math.round(parsed));
  }
  return 0;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

export function normalizeOnboardingPayload(input: unknown): OnboardingPayload | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;

  const companyName = asString(obj.companyName);
  const industry = asString(obj.industry);
  const teamSize = asString(obj.teamSize);
  const revenueModel = asString(obj.revenueModel);
  const documentationMaturity = asString(obj.documentationMaturity);
  const workflowMaturity = asString(obj.workflowMaturity);
  const projectComplexity = asString(obj.projectComplexity);
  const supportComplexity = asString(obj.supportComplexity);

  if (!companyName || !industry || !teamSize || !revenueModel) return null;
  if (!ALLOWED_LEVELS.has(documentationMaturity)) return null;
  if (!ALLOWED_LEVELS.has(workflowMaturity)) return null;
  if (!ALLOWED_LEVELS.has(projectComplexity)) return null;
  if (!ALLOWED_LEVELS.has(supportComplexity)) return null;

  const painPoints = asStringArray(obj.painPoints);
  const growthGoals = asStringArray(obj.growthGoals);
  const answers = Array.isArray(obj.answers)
    ? obj.answers
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Record<string, unknown>;
          const questionKey = asString(row.questionKey);
          if (!questionKey) return null;
          return { questionKey, answer: row.answer };
        })
        .filter((item): item is { questionKey: string; answer: unknown } => Boolean(item))
    : [];

  return {
    companyName,
    website: asString(obj.website),
    industry,
    teamSize,
    revenueModel,
    leadVolume: asNumber(obj.leadVolume),
    supportVolume: asNumber(obj.supportVolume),
    documentationMaturity: documentationMaturity as "low" | "medium" | "high",
    workflowMaturity: workflowMaturity as "low" | "medium" | "high",
    projectComplexity: projectComplexity as "low" | "medium" | "high",
    supportComplexity: supportComplexity as "low" | "medium" | "high",
    painPoints,
    growthGoals,
    answers
  };
}
