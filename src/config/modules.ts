import { ModuleDefinition } from "@/lib/acg/types";

export const MODULE_CATALOG: ModuleDefinition[] = [
  {
    slug: "lead-capture-automation",
    name: "Lead Capture Automation",
    category: "sales",
    description: "Captures inbound leads from forms and routes them to the right owner instantly.",
    problemSolved: "Slow or inconsistent lead intake and assignment.",
    expectedOutcomes: ["Lower lead response time", "Higher qualification coverage"],
    requiredIntegrations: ["Email"],
    complexity: "low",
    setupEstimate: "2-4 hours"
  },
  {
    slug: "follow-up-automation",
    name: "Follow-Up Automation",
    category: "sales",
    description: "Automates timed follow-ups across new leads and stale opportunities.",
    problemSolved: "Deals lost due to inconsistent follow-up.",
    expectedOutcomes: ["More recovered pipeline", "Lower no-response rate"],
    requiredIntegrations: ["Email", "CRM"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    slug: "support-ticket-triage",
    name: "Support Ticket Triage",
    category: "support",
    description: "Scores urgency and routes support requests to the right queue.",
    problemSolved: "Backlog growth and uneven response quality.",
    expectedOutcomes: ["Improved SLA performance", "Reduced triage overhead"],
    requiredIntegrations: ["Helpdesk"],
    complexity: "medium",
    setupEstimate: "1-2 days"
  },
  {
    slug: "sop-builder",
    name: "SOP Builder",
    category: "knowledge",
    description: "Turns tribal process knowledge into standardized SOP documents.",
    problemSolved: "Inconsistent process execution and onboarding time.",
    expectedOutcomes: ["Faster ramp time", "Lower delivery variance"],
    requiredIntegrations: [],
    complexity: "low",
    setupEstimate: "4-6 hours"
  },
  {
    slug: "executive-intelligence-dashboard",
    name: "Executive Intelligence Dashboard",
    category: "executive",
    description: "Unified KPI command view for revenue, service health, and operations risk.",
    problemSolved: "Lack of executive visibility across critical workflows.",
    expectedOutcomes: ["Faster decisions", "Early risk detection"],
    requiredIntegrations: ["CRM", "Helpdesk"],
    complexity: "medium",
    setupEstimate: "1 day"
  }
];
