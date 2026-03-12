import { ModuleDefinition } from "@/lib/acg/types";

type RawModule = {
  name: string;
  category: string;
  description: string;
  problemSolved: string;
  expectedOutcomes: string[];
  requiredIntegrations: string[];
  complexity: "low" | "medium" | "high";
  setupEstimate: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toModule(raw: RawModule): ModuleDefinition {
  const slug = slugify(raw.name);
  return {
    slug,
    ...raw,
    defaultWorkflows: [`${raw.name} default workflow`],
    promptHooks: [`${slug}:primary`],
    dashboardWidgets: [`${slug}:summary`],
    analyticsEvents: [`${slug}.installed`, `${slug}.used`]
  };
}

const RAW_MODULES: RawModule[] = [
  {
    name: "Lead Capture Automation",
    category: "sales",
    description: "Captures inbound leads from forms and routes them immediately.",
    problemSolved: "Slow lead intake and assignment.",
    expectedOutcomes: ["Lower response time", "Higher lead coverage"],
    requiredIntegrations: ["Email", "Forms"],
    complexity: "low",
    setupEstimate: "2-4 hours"
  },
  {
    name: "Lead Qualification AI",
    category: "sales",
    description: "Scores qualification likelihood and service fit from inbound context.",
    problemSolved: "Inconsistent qualification quality.",
    expectedOutcomes: ["Higher SQL quality", "Better rep prioritization"],
    requiredIntegrations: ["CRM"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Lead Scoring Engine",
    category: "sales",
    description: "Applies deterministic + AI-enhanced scoring for pipeline ranking.",
    problemSolved: "No objective lead prioritization model.",
    expectedOutcomes: ["Improved conversion", "Cleaner pipeline focus"],
    requiredIntegrations: ["CRM"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Automated Lead Response",
    category: "sales",
    description: "Initiates immediate response sequences for new leads.",
    problemSolved: "Delayed first-touch outreach.",
    expectedOutcomes: ["Faster first response", "Higher engagement"],
    requiredIntegrations: ["Email", "SMS"],
    complexity: "low",
    setupEstimate: "4-6 hours"
  },
  {
    name: "Follow-Up Automation",
    category: "sales",
    description: "Automates multi-step follow-ups for non-responsive prospects.",
    problemSolved: "Lost opportunities due to follow-up inconsistency.",
    expectedOutcomes: ["Recovered deals", "Lower stale opportunities"],
    requiredIntegrations: ["Email", "CRM"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Proposal Generator",
    category: "sales",
    description: "Builds first-draft proposals from opportunity data and templates.",
    problemSolved: "Slow proposal turnaround.",
    expectedOutcomes: ["Faster quoting", "Higher proposal consistency"],
    requiredIntegrations: ["CRM", "Docs"],
    complexity: "medium",
    setupEstimate: "1-2 days"
  },
  {
    name: "Quote Generator",
    category: "sales",
    description: "Creates quote drafts aligned to service catalog and pricing guardrails.",
    problemSolved: "Manual quote creation bottlenecks.",
    expectedOutcomes: ["Shorter quote cycle", "Lower pricing errors"],
    requiredIntegrations: ["CRM", "Billing"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Sales Call Prep Agent",
    category: "sales",
    description: "Generates call briefs with account context and recommended actions.",
    problemSolved: "Poor call readiness and context switching.",
    expectedOutcomes: ["Better discovery quality", "Higher close probability"],
    requiredIntegrations: ["CRM", "Calendar"],
    complexity: "low",
    setupEstimate: "4-8 hours"
  },
  {
    name: "Objection Tracking",
    category: "sales",
    description: "Tracks and clusters recurring objections for coaching and messaging.",
    problemSolved: "Objection handling is ad hoc and unmeasured.",
    expectedOutcomes: ["Improved objection handling", "Refined messaging"],
    requiredIntegrations: ["CRM"],
    complexity: "low",
    setupEstimate: "4-6 hours"
  },
  {
    name: "Pipeline Risk Detection",
    category: "sales",
    description: "Flags stalled and high-risk opportunities with reasons and next actions.",
    problemSolved: "Late discovery of deal risk.",
    expectedOutcomes: ["Earlier intervention", "Higher forecast reliability"],
    requiredIntegrations: ["CRM"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Support Ticket Triage",
    category: "support",
    description: "Prioritizes and routes tickets by urgency, impact, and SLA risk.",
    problemSolved: "Backlogs and inconsistent routing.",
    expectedOutcomes: ["Improved SLA adherence", "Faster triage"],
    requiredIntegrations: ["Helpdesk"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Email Response Assistant",
    category: "support",
    description: "Drafts support responses from policy, tone, and knowledge context.",
    problemSolved: "Slow and inconsistent support responses.",
    expectedOutcomes: ["Faster handling", "Higher response consistency"],
    requiredIntegrations: ["Email", "Helpdesk"],
    complexity: "low",
    setupEstimate: "4-8 hours"
  },
  {
    name: "Customer Sentiment Detection",
    category: "support",
    description: "Detects sentiment shifts and escalation signals in customer interactions.",
    problemSolved: "Escalations detected too late.",
    expectedOutcomes: ["Earlier escalation handling", "Lower churn risk"],
    requiredIntegrations: ["Helpdesk", "Email"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "SLA Risk Alerts",
    category: "support",
    description: "Monitors SLA thresholds and alerts owners before breach windows.",
    problemSolved: "SLA misses due to poor visibility.",
    expectedOutcomes: ["Fewer breaches", "Improved trust"],
    requiredIntegrations: ["Helpdesk"],
    complexity: "low",
    setupEstimate: "4-6 hours"
  },
  {
    name: "Customer Onboarding System",
    category: "support",
    description: "Standardizes client onboarding milestones, artifacts, and handoffs.",
    problemSolved: "Inconsistent onboarding execution.",
    expectedOutcomes: ["Faster time-to-value", "Lower onboarding variance"],
    requiredIntegrations: ["Project Management", "Docs"],
    complexity: "medium",
    setupEstimate: "1-2 days"
  },
  {
    name: "Review Request Automation",
    category: "support",
    description: "Triggers review requests after successful service milestones.",
    problemSolved: "No repeatable review-generation process.",
    expectedOutcomes: ["Higher review volume", "Improved reputation signals"],
    requiredIntegrations: ["Email", "CRM"],
    complexity: "low",
    setupEstimate: "4 hours"
  },
  {
    name: "Process Mapping AI",
    category: "operations",
    description: "Transforms process notes into map-ready operating flows.",
    problemSolved: "No shared process map baseline.",
    expectedOutcomes: ["Clearer ownership", "Faster bottleneck discovery"],
    requiredIntegrations: ["Docs"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Bottleneck Detection",
    category: "operations",
    description: "Identifies throughput bottlenecks across core workflows.",
    problemSolved: "Hidden workflow constraints.",
    expectedOutcomes: ["Higher throughput", "Reduced cycle times"],
    requiredIntegrations: ["Project Management"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Workflow Optimization",
    category: "operations",
    description: "Recommends process redesign actions from execution telemetry.",
    problemSolved: "Workflow friction persists without measurable optimization.",
    expectedOutcomes: ["Lower rework", "Higher execution quality"],
    requiredIntegrations: ["Project Management", "CRM"],
    complexity: "high",
    setupEstimate: "2-3 days"
  },
  {
    name: "Task Routing Engine",
    category: "operations",
    description: "Routes tasks to owners based on role, queue, and workload signals.",
    problemSolved: "Manual assignment and owner ambiguity.",
    expectedOutcomes: ["Faster assignment", "Balanced workloads"],
    requiredIntegrations: ["Project Management"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Process Compliance Monitoring",
    category: "operations",
    description: "Tracks required process steps and flags policy deviations.",
    problemSolved: "Non-compliant execution is found too late.",
    expectedOutcomes: ["Higher compliance", "Reduced quality drift"],
    requiredIntegrations: ["Project Management", "Docs"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Operations Dashboard",
    category: "operations",
    description: "Provides command-level operational KPIs for owners and managers.",
    problemSolved: "No single operations health view.",
    expectedOutcomes: ["Better prioritization", "Faster incident response"],
    requiredIntegrations: ["CRM", "Project Management"],
    complexity: "low",
    setupEstimate: "4-8 hours"
  },
  {
    name: "SOP Builder",
    category: "knowledge",
    description: "Converts process knowledge into structured SOP artifacts.",
    problemSolved: "Tribal knowledge concentration.",
    expectedOutcomes: ["Faster onboarding", "Higher consistency"],
    requiredIntegrations: ["Docs"],
    complexity: "low",
    setupEstimate: "4-6 hours"
  },
  {
    name: "SOP Cleanup",
    category: "knowledge",
    description: "Normalizes and de-duplicates SOP libraries for clarity.",
    problemSolved: "Fragmented SOP quality and structure.",
    expectedOutcomes: ["Cleaner SOP corpus", "Higher retrieval quality"],
    requiredIntegrations: ["Docs"],
    complexity: "low",
    setupEstimate: "4-8 hours"
  },
  {
    name: "Knowledge Base Creator",
    category: "knowledge",
    description: "Builds searchable internal KB entries from docs and transcripts.",
    problemSolved: "Knowledge is hard to find.",
    expectedOutcomes: ["Faster answers", "Lower repeated questions"],
    requiredIntegrations: ["Docs"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Document Summarization",
    category: "knowledge",
    description: "Creates concise summaries and action points from internal documents.",
    problemSolved: "Long documents slow execution.",
    expectedOutcomes: ["Faster review", "Clear action extraction"],
    requiredIntegrations: ["Docs"],
    complexity: "low",
    setupEstimate: "4 hours"
  },
  {
    name: "Training Content Generator",
    category: "knowledge",
    description: "Produces role-specific onboarding and training materials.",
    problemSolved: "Training content creation is slow and inconsistent.",
    expectedOutcomes: ["Faster new-hire ramp", "Standardized training"],
    requiredIntegrations: ["Docs"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Smart Scheduling",
    category: "project",
    description: "Optimizes schedules based on constraints, dependencies, and workload.",
    problemSolved: "Manual scheduling overhead.",
    expectedOutcomes: ["Fewer conflicts", "Higher schedule reliability"],
    requiredIntegrations: ["Calendar", "Project Management"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Project Status Reports",
    category: "project",
    description: "Auto-generates project status reports for internal and client stakeholders.",
    problemSolved: "Manual status reporting burden.",
    expectedOutcomes: ["Faster reporting", "Improved transparency"],
    requiredIntegrations: ["Project Management"],
    complexity: "low",
    setupEstimate: "4-8 hours"
  },
  {
    name: "Task Dependency Detection",
    category: "project",
    description: "Detects and visualizes blocking dependencies across task graphs.",
    problemSolved: "Blocked work discovered late.",
    expectedOutcomes: ["Earlier unblock actions", "Reduced delays"],
    requiredIntegrations: ["Project Management"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Delay Risk Detection",
    category: "project",
    description: "Predicts delay risk from milestone trends and workload pressure.",
    problemSolved: "Schedule slippage discovered reactively.",
    expectedOutcomes: ["Proactive escalation", "Better deadline adherence"],
    requiredIntegrations: ["Project Management"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Workload Balancing",
    category: "project",
    description: "Balances assignments across teams to reduce overload and idle time.",
    problemSolved: "Uneven workload distribution.",
    expectedOutcomes: ["Higher team utilization", "Lower burnout risk"],
    requiredIntegrations: ["Project Management", "HRIS"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Revenue Leak Detection",
    category: "revenue",
    description: "Flags missed follow-ups, unbilled work, and stalled quote-to-close paths.",
    problemSolved: "Revenue leaks hidden in day-to-day operations.",
    expectedOutcomes: ["Recovered revenue", "Lower leakage risk"],
    requiredIntegrations: ["CRM", "Billing"],
    complexity: "high",
    setupEstimate: "2 days"
  },
  {
    name: "Upsell Opportunity Engine",
    category: "revenue",
    description: "Identifies upsell moments from account usage and service patterns.",
    problemSolved: "Upsell opportunities are missed.",
    expectedOutcomes: ["Higher expansion revenue", "More proactive account growth"],
    requiredIntegrations: ["CRM", "Billing"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Cross-Sell Recommendations",
    category: "revenue",
    description: "Suggests adjacent service offers based on account profile and outcomes.",
    problemSolved: "Cross-sell motions are inconsistent.",
    expectedOutcomes: ["Higher attach rate", "Improved account value"],
    requiredIntegrations: ["CRM"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Quote Follow-Up Automation",
    category: "revenue",
    description: "Runs quote reminder sequences tied to stage aging and response signals.",
    problemSolved: "Quotes go stale without follow-up.",
    expectedOutcomes: ["More quote closes", "Lower quote decay"],
    requiredIntegrations: ["CRM", "Email"],
    complexity: "low",
    setupEstimate: "4-8 hours"
  },
  {
    name: "Reactivation Campaigns",
    category: "revenue",
    description: "Re-engages dormant leads and inactive customers with tailored sequences.",
    problemSolved: "Dormant pipeline is ignored.",
    expectedOutcomes: ["Recovered opportunities", "Higher winback rate"],
    requiredIntegrations: ["CRM", "Email"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Invoice Drafting",
    category: "finance",
    description: "Creates invoice drafts from completed work events and policy rules.",
    problemSolved: "Manual invoicing delays cash collection.",
    expectedOutcomes: ["Faster invoicing", "Lower billing errors"],
    requiredIntegrations: ["Billing"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Accounts Receivable Reminders",
    category: "finance",
    description: "Automates AR follow-up cadence with escalation thresholds.",
    problemSolved: "Inconsistent collections process.",
    expectedOutcomes: ["Lower DSO", "Improved collection discipline"],
    requiredIntegrations: ["Billing", "Email"],
    complexity: "low",
    setupEstimate: "4-6 hours"
  },
  {
    name: "Expense Categorization",
    category: "finance",
    description: "Classifies expenses into reporting categories with policy checks.",
    problemSolved: "Manual categorization overhead.",
    expectedOutcomes: ["Cleaner books", "Faster close cycles"],
    requiredIntegrations: ["Accounting"],
    complexity: "low",
    setupEstimate: "4-8 hours"
  },
  {
    name: "Cash Flow Dashboard",
    category: "finance",
    description: "Surfaces projected cash inflows/outflows with scenario views.",
    problemSolved: "Poor short-term cash visibility.",
    expectedOutcomes: ["Better cash planning", "Faster risk response"],
    requiredIntegrations: ["Accounting", "Billing"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Resume Screening AI",
    category: "hr",
    description: "Screens resumes against role criteria and highlights fit/risk.",
    problemSolved: "Manual screening bottlenecks.",
    expectedOutcomes: ["Faster shortlist", "Consistent candidate scoring"],
    requiredIntegrations: ["ATS"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Interview Summary AI",
    category: "hr",
    description: "Summarizes interviews and extracts competency signals.",
    problemSolved: "Interview notes are inconsistent and incomplete.",
    expectedOutcomes: ["Better hiring decisions", "Standardized feedback"],
    requiredIntegrations: ["ATS", "Docs"],
    complexity: "low",
    setupEstimate: "4-8 hours"
  },
  {
    name: "Employee Onboarding Workflows",
    category: "hr",
    description: "Automates role onboarding checklists, docs, and milestone tracking.",
    problemSolved: "New-hire onboarding is fragmented.",
    expectedOutcomes: ["Faster ramp-up", "Higher completion rates"],
    requiredIntegrations: ["HRIS", "Docs"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "SEO Content Generator",
    category: "marketing",
    description: "Generates SEO-aligned content drafts based on topic and intent.",
    problemSolved: "Content production is too slow.",
    expectedOutcomes: ["Higher publishing cadence", "Better organic visibility"],
    requiredIntegrations: ["CMS"],
    complexity: "low",
    setupEstimate: "4-6 hours"
  },
  {
    name: "Blog Writer",
    category: "marketing",
    description: "Produces long-form article drafts with brand/tone controls.",
    problemSolved: "Blog pipeline stalls due to writing capacity.",
    expectedOutcomes: ["More output", "Consistent quality baseline"],
    requiredIntegrations: ["CMS"],
    complexity: "low",
    setupEstimate: "4-6 hours"
  },
  {
    name: "Social Media Generator",
    category: "marketing",
    description: "Creates channel-ready post variations from campaign themes.",
    problemSolved: "Social output is inconsistent and manual.",
    expectedOutcomes: ["Higher posting cadence", "Message consistency"],
    requiredIntegrations: ["Social"],
    complexity: "low",
    setupEstimate: "4 hours"
  },
  {
    name: "Email Campaign Assistant",
    category: "marketing",
    description: "Drafts campaign sequences with segmentation-aware variants.",
    problemSolved: "Campaign setup time is high.",
    expectedOutcomes: ["Faster launches", "Improved campaign consistency"],
    requiredIntegrations: ["Email Marketing"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Landing Page Generator",
    category: "marketing",
    description: "Builds landing page draft copy aligned to offer and audience.",
    problemSolved: "Slow landing page creation.",
    expectedOutcomes: ["Faster experimentation", "Higher conversion readiness"],
    requiredIntegrations: ["CMS"],
    complexity: "medium",
    setupEstimate: "1 day"
  },
  {
    name: "Executive Intelligence Dashboard",
    category: "executive",
    description: "Unified KPI command center for revenue, delivery, and risk.",
    problemSolved: "Leadership lacks timely operational visibility.",
    expectedOutcomes: ["Faster decisions", "Earlier risk intervention"],
    requiredIntegrations: ["CRM", "Helpdesk", "Billing"],
    complexity: "medium",
    setupEstimate: "1 day"
  }
];

export const MODULE_CATALOG: ModuleDefinition[] = RAW_MODULES.map(toModule);
