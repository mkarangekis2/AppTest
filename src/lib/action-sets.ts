import { LaneType } from "@/lib/domain";

export type MedicActionSet = {
  laneType: LaneType;
  name: string;
  actions: string[];
  emphasis: string[];
};

const ACTION_SETS: Record<LaneType, MedicActionSet> = {
  "point-of-injury": {
    laneType: "point-of-injury",
    name: "Point of Injury",
    actions: [
      "Control massive hemorrhage",
      "Open airway",
      "Support breathing",
      "Seal chest wound",
      "Assess mental status",
      "Initiate reassessment",
      "Prepare casualty for movement"
    ],
    emphasis: ["Immediate bleed control", "Short verbal commands", "Rapid reassessment before movement"]
  },
  "prolonged-field-care": {
    laneType: "prolonged-field-care",
    name: "Prolonged Field Care",
    actions: [
      "Control massive hemorrhage",
      "Open airway",
      "Support breathing",
      "Check radial pulse",
      "Prevent heat loss",
      "Document treatment",
      "Initiate reassessment"
    ],
    emphasis: ["Trend vitals over time", "Comfort and insulation", "Deliberate reassessment cadence"]
  },
  evacuation: {
    laneType: "evacuation",
    name: "Evacuation",
    actions: [
      "Control massive hemorrhage",
      "Support breathing",
      "Package casualty",
      "Communicate handoff",
      "Initiate reassessment",
      "Prepare casualty for movement"
    ],
    emphasis: ["Secure interventions before movement", "Packaging discipline", "Handoff accuracy"]
  },
  "mass-casualty": {
    laneType: "mass-casualty",
    name: "Mass Casualty",
    actions: [
      "Direct casualty movement",
      "Control massive hemorrhage",
      "Open airway",
      "Support breathing",
      "Assign priority",
      "Initiate reassessment"
    ],
    emphasis: ["Triage decisions", "Task delegation", "Prioritize survivable interventions"]
  }
};

export function getMedicActionSet(laneType?: string | null): MedicActionSet {
  if (laneType && laneType in ACTION_SETS) {
    return ACTION_SETS[laneType as LaneType];
  }

  return ACTION_SETS["point-of-injury"];
}

export function listLaneTypes() {
  return Object.values(ACTION_SETS).map(({ laneType, name, emphasis }) => ({
    laneType,
    name,
    emphasis
  }));
}
