export type PlanName = "Starter" | "Growth" | "Pro" | "Enterprise";

export const PLAN_ENTITLEMENTS: Record<
  PlanName,
  { maxModules: number; maxWorkflows: number; maxUsers: number; aiMonthlyCredits: number }
> = {
  Starter: { maxModules: 5, maxWorkflows: 10, maxUsers: 3, aiMonthlyCredits: 5000 },
  Growth: { maxModules: 15, maxWorkflows: 40, maxUsers: 10, aiMonthlyCredits: 20000 },
  Pro: { maxModules: 40, maxWorkflows: 150, maxUsers: 30, aiMonthlyCredits: 80000 },
  Enterprise: { maxModules: 1000, maxWorkflows: 10000, maxUsers: 500, aiMonthlyCredits: 500000 }
};
