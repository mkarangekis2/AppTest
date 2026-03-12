import { PackageDefinition } from "@/lib/acg/types";

export const PACKAGE_CATALOG: PackageDefinition[] = [
  {
    slug: "lead-conversion-improvement-package",
    name: "Lead Conversion Improvement Package",
    category: "sales",
    description: "Improve lead capture speed, qualification quality, and close velocity.",
    includedModuleSlugs: [
      "lead-capture-automation",
      "lead-qualification-ai",
      "follow-up-automation",
      "proposal-generator",
      "reactivation-campaigns"
    ],
    setupEstimate: "3-5 days",
    bestFit: "Service teams with high inbound lead volume and follow-up gaps",
    roiStory: "Reduces response delay and stale pipeline leakage."
  },
  {
    slug: "operations-efficiency-package",
    name: "Operations Efficiency Package",
    category: "operations",
    description: "Map, optimize, and enforce operational workflows across the business.",
    includedModuleSlugs: [
      "process-mapping-ai",
      "bottleneck-detection",
      "workflow-optimization",
      "task-routing-engine",
      "process-compliance-monitoring"
    ],
    setupEstimate: "4-6 days",
    bestFit: "Teams with high manual coordination and process drift",
    roiStory: "Lowers cycle time and reduces rework caused by handoff ambiguity."
  },
  {
    slug: "documentation-and-knowledge-package",
    name: "Documentation and Knowledge Package",
    category: "knowledge",
    description: "Capture SOPs, clean existing docs, and make internal knowledge searchable.",
    includedModuleSlugs: [
      "sop-builder",
      "sop-cleanup",
      "knowledge-base-creator",
      "document-summarization",
      "training-content-generator"
    ],
    setupEstimate: "2-4 days",
    bestFit: "Owner-led teams with tribal knowledge concentration",
    roiStory: "Improves consistency and shortens onboarding ramp time."
  },
  {
    slug: "revenue-growth-package",
    name: "Revenue Growth Package",
    category: "revenue",
    description: "Increase account expansion and recover missed revenue opportunities.",
    includedModuleSlugs: [
      "revenue-leak-detection",
      "upsell-opportunity-engine",
      "cross-sell-recommendations",
      "quote-follow-up-automation",
      "reactivation-campaigns"
    ],
    setupEstimate: "3-5 days",
    bestFit: "Businesses with plateauing growth and stale quotes",
    roiStory: "Targets high-probability expansion and leak recovery paths."
  },
  {
    slug: "service-delivery-consistency-package",
    name: "Service Delivery Consistency Package",
    category: "support",
    description: "Standardize customer onboarding, support handling, and SLA performance.",
    includedModuleSlugs: [
      "support-ticket-triage",
      "sla-risk-alerts",
      "customer-onboarding-system",
      "customer-sentiment-detection",
      "operations-dashboard"
    ],
    setupEstimate: "3-4 days",
    bestFit: "Teams with variable service outcomes and support pressure",
    roiStory: "Improves customer experience consistency and lowers escalation risk."
  },
  {
    slug: "executive-visibility-package",
    name: "Executive Visibility Package",
    category: "executive",
    description: "Give leadership a single command layer for revenue, delivery, and execution signals.",
    includedModuleSlugs: [
      "executive-intelligence-dashboard",
      "operations-dashboard",
      "pipeline-risk-detection",
      "cash-flow-dashboard",
      "revenue-leak-detection"
    ],
    setupEstimate: "2-3 days",
    bestFit: "Owners needing clearer command-level reporting",
    roiStory: "Speeds decisions with centralized KPI and risk visibility."
  }
];
