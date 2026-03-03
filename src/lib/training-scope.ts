import { LaneType, TrainingLevel } from "@/lib/domain";

export type TrainingCapabilityProfile = {
  level: TrainingLevel;
  label: string;
  shortLabel: string;
  authoritySummary: string;
  circulation: string[];
  airway: string[];
  breathing: string[];
  allowedInterventions: string[];
  notWithinScope: string[];
  supervisionRules: string[];
  preferredInjuryPatterns: string[];
  scenarioComplexity: "basic" | "intermediate" | "advanced";
  medicalAssets: string[];
  treatmentWindow: string;
  focus: string[];
  commandExpectations: string[];
};

const TRAINING_CAPABILITIES: Record<TrainingLevel, TrainingCapabilityProfile> = {
  "ranger-first-responder": {
    level: "ranger-first-responder",
    label: "Ranger First Responder (RFR)",
    shortLabel: "RFR",
    authoritySummary: "Stabilize immediately, recognize shock, and hand off to higher medical authority early.",
    circulation: ["Peripheral IV placement per unit protocol", "Hemorrhage control across full MARCH", "Shock recognition"],
    airway: ["NPA placement", "Positioning", "Basic airway maneuvers"],
    breathing: ["Needle decompression when authorized by unit protocol", "Chest seal management"],
    allowedInterventions: [
      "Control massive hemorrhage",
      "Open airway",
      "Support breathing",
      "Insert NPA",
      "Place peripheral IV",
      "Initiate reassessment",
      "Prepare casualty for movement"
    ],
    notWithinScope: [
      "IO access",
      "TXA",
      "Blood handling",
      "ROLO initiation",
      "Digital thoracostomy",
      "Medication administration",
      "Surgical cricothyrotomy"
    ],
    supervisionRules: ["Escalate invasive or irreversible interventions to SOCM/Ranger Medic authority."],
    preferredInjuryPatterns: [
      "Extremity or junctional hemorrhage",
      "Simple airway positioning problem",
      "Breathing complaint manageable with chest seal or assessment",
      "Shock recognition without advanced pharmacology"
    ],
    scenarioComplexity: "basic",
    medicalAssets: ["IFAK", "peripheral IV kit if carried by unit SOP", "buddy aid support"],
    treatmentWindow: "First lifesaving actions expected inside 60 seconds with rapid handoff mindset.",
    focus: ["Bleeding control", "Basic airway intervention", "Early request for higher medical support"],
    commandExpectations: ["Use short casualty commands", "Call out major findings", "Request medic support early"]
  },
  "advanced-ranger-first-responder": {
    level: "advanced-ranger-first-responder",
    label: "Advanced Ranger First Responder (ARFR)",
    shortLabel: "ARFR",
    authoritySummary: "Expand capability forward with invasive procedures under protocol and medic authority structure.",
    circulation: ["Peripheral IV", "IO access", "TXA 2g IV push", "Initiate ROLO with approval", "Set up blood under medic direction"],
    airway: ["NPA placement", "Positioning", "Basic airway maneuvers"],
    breathing: ["Needle decompression", "Finger thoracostomy per protocol"],
    allowedInterventions: [
      "Control massive hemorrhage",
      "Open airway",
      "Support breathing",
      "Insert NPA",
      "Place peripheral IV",
      "Establish IO access",
      "Administer TXA",
      "Perform needle decompression",
      "Perform finger thoracostomy",
      "Initiate reassessment",
      "Prepare casualty for movement"
    ],
    notWithinScope: ["Supraglottic airway", "Surgical cricothyrotomy", "Independent blood administration authority", "Independent medication authority"],
    supervisionRules: [
      "Can execute invasive procedures, but overall medical decision authority still belongs to the SOCM/Ranger Medic."
    ],
    preferredInjuryPatterns: [
      "Hemorrhage with shock progression",
      "Chest injury requiring decompression decision",
      "Need for TXA or IO because IV access is difficult",
      "Distributed fight where medic direction may be delayed"
    ],
    scenarioComplexity: "intermediate",
    medicalAssets: ["Expanded aid pouch", "IO kit", "TXA", "decompression kit", "thoracostomy-capable equipment per protocol"],
    treatmentWindow: "Treat in place for 2-4 minutes before movement decision while extending forward capability.",
    focus: ["Invasive but protocol-bound intervention", "Breathing reassessment", "Time buying under distributed operations"],
    commandExpectations: ["Direct nearby Rangers", "Repeat reassessment findings", "Coordinate with medic direction"]
  },
  "ranger-medic": {
    level: "ranger-medic",
    label: "Ranger Medic / SOCM",
    shortLabel: "SOCM",
    authoritySummary: "Owns medical decision authority, escalation, prolonged management, and irreversible interventions when indicated.",
    circulation: ["IV / IO", "TXA", "Whole blood transfusion", "ROLO initiation authority", "Advanced shock management"],
    airway: ["NPA", "Advanced airway management", "Surgical cricothyrotomy when indicated", "RSI context dependent"],
    breathing: ["Needle decompression", "Finger thoracostomy", "Chest tubes when indicated", "Ventilation management"],
    allowedInterventions: [
      "Control massive hemorrhage",
      "Open airway",
      "Support breathing",
      "Insert NPA",
      "Place peripheral IV",
      "Establish IO access",
      "Administer TXA",
      "Perform needle decompression",
      "Perform finger thoracostomy",
      "Initiate blood transfusion",
      "Prepare surgical airway",
      "Lead prolonged field care reassessment",
      "Prepare casualty for movement"
    ],
    notWithinScope: [],
    supervisionRules: ["Independent medical authority for escalation, transfusion, pharmacology, and prolonged field care decisions."],
    preferredInjuryPatterns: [
      "Multi-system trauma",
      "Shock requiring blood or TXA decisions",
      "Airway failure risk",
      "Chest injury requiring decompression or thoracostomy",
      "Prolonged field care leadership"
    ],
    scenarioComplexity: "advanced",
    medicalAssets: ["Medic aid bag", "IO kit", "TXA", "whole blood / blood setup capability", "advanced airway kit", "thoracic intervention kit"],
    treatmentWindow: "Immediate control plus sustained reassessment through CCP handoff or prolonged field care continuation.",
    focus: ["Decision authority", "Escalation to advanced interventions", "Sustained casualty ownership"],
    commandExpectations: ["Control the treatment space", "Delegate tasks", "Prepare formal medical handoff", "Lead prolonged casualty management"]
  }
};

export function getTrainingCapabilityProfile(trainingLevel: TrainingLevel): TrainingCapabilityProfile {
  return TRAINING_CAPABILITIES[trainingLevel];
}

export function getScopedMedicActions(trainingLevel: TrainingLevel, laneType: LaneType, baseActions: string[]) {
  const profile = getTrainingCapabilityProfile(trainingLevel);
  const result = [...baseActions];

  for (const action of profile.allowedInterventions) {
    if (!result.includes(action)) {
      const shouldInclude =
        laneType === "prolonged-field-care" ||
        laneType === "evacuation" ||
        action.includes("hemorrhage") ||
        action.includes("airway") ||
        action.includes("breathing") ||
        action.includes("reassessment") ||
        action.includes("movement");

      if (shouldInclude) {
        result.push(action);
      }
    }
  }

  return result;
}

export function listTrainingCapabilitySummaries() {
  return Object.values(TRAINING_CAPABILITIES).map((profile) => ({
    value: profile.level,
    label: profile.label,
    focus: profile.focus,
    authoritySummary: profile.authoritySummary
  }));
}
