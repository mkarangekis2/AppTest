import { PackageDefinition } from "@/lib/acg/types";

export const PACKAGE_CATALOG: PackageDefinition[] = [
  {
    slug: "lead-conversion-improvement",
    name: "Lead Conversion Improvement Package",
    category: "sales",
    description: "Improves response speed, follow-up consistency, and proposal throughput.",
    includedModuleSlugs: ["lead-capture-automation", "follow-up-automation"],
    setupEstimate: "2-3 days"
  },
  {
    slug: "documentation-and-knowledge",
    name: "Documentation and Knowledge Package",
    category: "operations",
    description: "Builds reusable SOPs and searchable operational knowledge artifacts.",
    includedModuleSlugs: ["sop-builder"],
    setupEstimate: "1-2 days"
  },
  {
    slug: "executive-visibility",
    name: "Executive Visibility Package",
    category: "executive",
    description: "Establishes KPI monitoring and risk visibility for leadership.",
    includedModuleSlugs: ["executive-intelligence-dashboard"],
    setupEstimate: "1 day"
  }
];
