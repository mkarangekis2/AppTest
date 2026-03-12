export type MaturityLevel = "low" | "medium" | "high";
export type ComplexityLevel = "low" | "medium" | "high";

export type OnboardingPayload = {
  companyName: string;
  website?: string;
  industry: string;
  teamSize: string;
  revenueModel: string;
  leadVolume: number;
  supportVolume: number;
  documentationMaturity: MaturityLevel;
  workflowMaturity: MaturityLevel;
  projectComplexity: ComplexityLevel;
  supportComplexity: ComplexityLevel;
  painPoints: string[];
  growthGoals: string[];
  answers: Array<{ questionKey: string; answer: unknown }>;
};

export type AnalysisScores = {
  leadHandling: number;
  documentation: number;
  serviceDelivery: number;
  automationPotential: number;
  revenueLeakageRisk: number;
  executiveVisibility: number;
};

export type BusinessAnalysis = {
  summary: string;
  prioritizedPainPoints: string[];
  scores: AnalysisScores;
  opportunities: string[];
  riskAreas: string[];
};

export type ModuleDefinition = {
  slug: string;
  name: string;
  category: string;
  description: string;
  problemSolved: string;
  expectedOutcomes: string[];
  requiredIntegrations: string[];
  complexity: "low" | "medium" | "high";
  setupEstimate: string;
  defaultWorkflows: string[];
  promptHooks: string[];
  dashboardWidgets: string[];
  analyticsEvents: string[];
};

export type PackageDefinition = {
  slug: string;
  name: string;
  category: string;
  description: string;
  includedModuleSlugs: string[];
  setupEstimate: string;
  roiStory?: string;
  bestFit?: string;
};

export type IndustryPackDefinition = {
  slug: string;
  name: string;
  industries: string[];
  description: string;
  includedModuleSlugs: string[];
  defaultWorkflowTemplates: string[];
  kpiPresets: string[];
};

export type RecommendationItem = {
  recommendationType: "module" | "package" | "industry_pack";
  slug: string;
  title: string;
  problemSolved: string;
  reason: string;
  expectedImpact: "low" | "medium" | "high";
  implementationComplexity: "low" | "medium" | "high";
  setupEstimate: string;
  requiredIntegrations: string[];
  evidence: Record<string, unknown>;
};
