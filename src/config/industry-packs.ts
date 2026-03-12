import { IndustryPackDefinition } from "@/lib/acg/types";

export const INDUSTRY_PACK_CATALOG: IndustryPackDefinition[] = [
  {
    slug: "it-managed-services-pack",
    name: "IT and Managed Services Pack",
    industries: ["it services", "managed services", "msp"],
    description: "Preconfigured workflows for ticket triage, SLA control, and renewals in managed service operations.",
    includedModuleSlugs: [
      "support-ticket-triage",
      "sla-risk-alerts",
      "customer-sentiment-detection",
      "operations-dashboard",
      "executive-intelligence-dashboard"
    ],
    defaultWorkflowTemplates: ["SLA escalation", "Ticket urgency routing", "Renewal risk follow-up"],
    kpiPresets: ["SLA attainment", "First-response time", "Ticket backlog health", "Renewal risk"]
  },
  {
    slug: "construction-trades-pack",
    name: "Construction and Trades Pack",
    industries: ["construction", "trades", "contractor"],
    description: "Operational controls for scheduling, delay risk, handoffs, and field delivery reporting.",
    includedModuleSlugs: [
      "smart-scheduling",
      "delay-risk-detection",
      "task-dependency-detection",
      "project-status-reports",
      "workflow-optimization"
    ],
    defaultWorkflowTemplates: ["Project delay alert", "Crew assignment routing", "Daily status digest"],
    kpiPresets: ["Schedule adherence", "Rework rate", "Project margin protection", "Delay incidence"]
  },
  {
    slug: "staffing-recruiting-pack",
    name: "Staffing and Recruiting Pack",
    industries: ["staffing", "recruiting", "talent"],
    description: "Pipeline acceleration for candidate screening, interview synthesis, and follow-up execution.",
    includedModuleSlugs: [
      "resume-screening-ai",
      "interview-summary-ai",
      "follow-up-automation",
      "pipeline-risk-detection",
      "operations-dashboard"
    ],
    defaultWorkflowTemplates: ["Candidate qualification", "Interview debrief synthesis", "Pipeline stall recovery"],
    kpiPresets: ["Time-to-submit", "Interview-to-offer rate", "Req fill velocity", "Candidate drop-off"]
  },
  {
    slug: "accounting-advisory-pack",
    name: "Accounting / Bookkeeping / Advisory Pack",
    industries: ["accounting", "bookkeeping", "advisory"],
    description: "Improves collections, documentation quality, and visibility into client delivery and cash health.",
    includedModuleSlugs: [
      "accounts-receivable-reminders",
      "invoice-drafting",
      "cash-flow-dashboard",
      "document-summarization",
      "executive-intelligence-dashboard"
    ],
    defaultWorkflowTemplates: ["AR reminder cadence", "Month-end close checklist", "Cash flow alerting"],
    kpiPresets: ["DSO", "Cash coverage", "Close cycle time", "Client profitability"]
  },
  {
    slug: "logistics-transportation-pack",
    name: "Logistics and Transportation Pack",
    industries: ["logistics", "transportation", "freight"],
    description: "Coordinates scheduling, delay mitigation, and operational signal visibility across moving workflows.",
    includedModuleSlugs: [
      "smart-scheduling",
      "task-routing-engine",
      "delay-risk-detection",
      "operations-dashboard",
      "executive-intelligence-dashboard"
    ],
    defaultWorkflowTemplates: ["Dispatch assignment routing", "Delay escalation", "Daily route performance digest"],
    kpiPresets: ["On-time performance", "Route delay risk", "Exception resolution time", "Service reliability"]
  },
  {
    slug: "professional-services-pack",
    name: "Professional Services Pack",
    industries: ["professional services", "consulting", "agency"],
    description: "Standardizes client onboarding, project control, and revenue expansion workflows.",
    includedModuleSlugs: [
      "customer-onboarding-system",
      "project-status-reports",
      "upsell-opportunity-engine",
      "quote-follow-up-automation",
      "executive-intelligence-dashboard"
    ],
    defaultWorkflowTemplates: ["Client onboarding milestone tracking", "Weekly client status brief", "Expansion opportunity alerts"],
    kpiPresets: ["Utilization", "Project margin", "Expansion revenue", "Client health score"]
  }
];
