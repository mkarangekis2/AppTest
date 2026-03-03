import { getMedicActionSet } from "@/lib/action-sets";
import { LaneType, TrainingLevel } from "@/lib/domain";
import { getTrainingCapabilityProfile, listTrainingCapabilitySummaries } from "@/lib/training-scope";

type GeneratedConop = {
  title: string;
  rawText: string;
  laneType: LaneType;
  unit: string;
  location: string;
  objective: string;
  metadata: Record<string, unknown>;
};

const units = ["1st Platoon, A Co, 1/75", "2d Platoon, B Co, 2/75", "3d Platoon, C Co, 3/75"];
const locations = ["urban objective compound", "wadi-side HLZ corridor", "mountain village edge", "dry riverbed approach lane"];
const weather = ["clear and cold", "dusty with light wind", "hot and dry", "low illumination after nautical twilight"];
const enemyPostures = [
  "Two armed personnel observed near the breach point with possible early warning observer",
  "Unknown enemy strength, likely 3-5 fighters with interior rooms uncleared",
  "Contact broken but sporadic small-arms fire continues from adjacent structure",
  "Enemy force displaced, but secondary device threat remains high"
];

const missionTemplates: Array<{
  laneType: LaneType;
  objective: string;
  casualtyMechanism: string;
  timeline: string;
  injuries: string[];
  assets: string[];
}> = [
  {
    laneType: "point-of-injury",
    objective: "Assault the breach, clear the target building, and maintain momentum through the objective",
    casualtyMechanism: "primary breacher is hit by fragmentation during explosive breach entry",
    timeline: "medic reaches casualty within 45-60 seconds and must stabilize in place before movement",
    injuries: ["junctional hemorrhage to upper thigh", "pain-limited breathing after blast exposure"],
    assets: ["one Ranger medic bag on trail man", "two IFAKs immediately available", "one SKED litter 2 minutes behind the element"]
  },
  {
    laneType: "prolonged-field-care",
    objective: "Hold a casualty collection point while follow-on movement is delayed by weather and enemy observation",
    casualtyMechanism: "dismounted Ranger is hit by blast and fall trauma during movement off the objective",
    timeline: "evacuation is delayed 30-45 minutes and repeated reassessment is required",
    injuries: ["controlled extremity bleed with shock risk", "altered mentation trend", "cold stress / heat loss risk"],
    assets: ["one medic aid bag", "limited warming gear", "blood products not available", "radio contact with higher available"]
  },
  {
    laneType: "evacuation",
    objective: "Move the casualty from objective to CCP and prepare for rotary-wing or ground handoff",
    casualtyMechanism: "casualty is wounded during exfil under intermittent fire",
    timeline: "treatment must be secured before loading and reassessed during movement windows",
    injuries: ["leg hemorrhage with movement sensitivity", "possible chest injury requiring repeat checks"],
    assets: ["litter team available", "casualty blanket", "radio with 9-line capability", "one additional aid-and-litter Ranger"]
  },
  {
    laneType: "mass-casualty",
    objective: "Triage multiple casualties after a blast in the target area while maintaining security priorities",
    casualtyMechanism: "secondary device injures multiple Rangers during consolidation",
    timeline: "first treatment decisions occur inside 60 seconds while competing casualties remain in view",
    injuries: ["severe extremity bleeding in the primary training casualty", "secondary casualty complaints nearby", "confusion under noise and crowding"],
    assets: ["multiple IFAKs", "one Ranger medic", "one litter", "limited room to work inside the structure"]
  }
];

export function listTrainingLevels() {
  return listTrainingCapabilitySummaries();
}

export function generateRandomConop(trainingLevel: TrainingLevel): GeneratedConop {
  const template = pick(missionTemplates);
  const profile = getTrainingCapabilityProfile(trainingLevel);
  const unit = pick(units);
  const location = pick(locations);
  const currentWeather = pick(weather);
  const enemyPosture = pick(enemyPostures);
  const actionSet = getMedicActionSet(template.laneType, trainingLevel);
  const title = `${profile.label} ${template.laneType.replace(/-/g, " ")} lane for ${unit}`;
  const scopedInjuries = scopedInjuriesForLevel(template.injuries, profile.preferredInjuryPatterns);

  const rawText = [
    `${unit} conducts a Ranger platoon mission rehearsal at the ${location}.`,
    `Mission objective: ${template.objective}.`,
    `During execution, the primary training casualty event occurs when the ${template.casualtyMechanism}.`,
    `Environmental conditions are ${currentWeather}, and enemy posture is assessed as: ${enemyPosture}.`,
    `Expected casualty problems include ${scopedInjuries.join(", ")}.`,
    `Medical assets on hand: ${[...template.assets, ...profile.medicalAssets].join(", ")}.`,
    `Training audience is ${profile.label}; ${profile.treatmentWindow}.`,
    `Evaluation focus: ${profile.focus.join(", ")}.`,
    `Authority model: ${profile.authoritySummary}.`,
    `Interventions within scope include: ${[...profile.circulation, ...profile.airway, ...profile.breathing].join(", ")}.`,
    profile.notWithinScope.length ? `Not within scope: ${profile.notWithinScope.join(", ")}.` : "No additional scope exclusions beyond clinical judgment.",
    `Command-and-control expectations: ${profile.commandExpectations.join(", ")}.`,
    `Lane action set should emphasize ${actionSet.actions.join(", ")}.`,
    "AI outputs must remain training-only, proctor controlled, and scenario bounded."
  ].join(" ");

  return {
    title,
    rawText,
    laneType: template.laneType,
    unit,
    location,
    objective: template.objective,
    metadata: {
      training_level: trainingLevel,
      training_level_label: profile.label,
      weather: currentWeather,
      enemy_posture: enemyPosture,
      medical_assets: [...template.assets, ...profile.medicalAssets],
      treatment_time_window: profile.treatmentWindow,
      injury_focus: scopedInjuries,
      command_expectations: profile.commandExpectations,
      authority_summary: profile.authoritySummary,
      within_scope: {
        circulation: profile.circulation,
        airway: profile.airway,
        breathing: profile.breathing
      },
      not_within_scope: profile.notWithinScope,
      supervision_rules: profile.supervisionRules,
      notes: "Synthetic training CONOP generated for scenario drafting."
    }
  };
}

function scopedInjuriesForLevel(baseInjuries: string[], scopedPatterns: string[]) {
  return [...baseInjuries, ...scopedPatterns.slice(0, 2)];
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
