import { LaneType, TrainingLevel } from "@/lib/domain";

type InjuryTemplate = {
  label: string;
  region: string;
  type: string;
  severity: "mild" | "moderate" | "severe";
  visible_findings: string[];
  hidden_findings: string[];
  expected_interventions: string[];
  critical_errors: string[];
};

export type CasualtyContext = {
  profileId: string;
  scenarioNameSuffix: string;
  setting: string;
  moi: string;
  summary: string;
  openingLine: string;
  chiefComplaint: string;
  demeanor: string;
  answers: {
    what_happened: string;
    where_does_it_hurt: string;
    can_you_breathe: string;
    are_you_bleeding: string;
  };
  behaviorCues: string[];
  injuries: InjuryTemplate[];
  constraints: string[];
  resources: string[];
};

export function inferCasualtyContext(input: {
  title: string;
  rawText: string;
  metadata: Record<string, unknown>;
  laneType?: LaneType;
  trainingLevel?: TrainingLevel;
}): CasualtyContext {
  const text = `${input.title} ${input.rawText} ${JSON.stringify(input.metadata)}`.toLowerCase();

  if (/(rollover|vehicle|convoy|mounted|truck|matv)/.test(text)) {
    return vehicleAmbushContext(input.trainingLevel);
  }

  if (/(fall|rappel|cliff|roof|ladder|wall|drop)/.test(text)) {
    return verticalFallContext(input.trainingLevel);
  }

  if (/(sniper|small-arms|gunshot|gsw|ambush|room clear|interior fire)/.test(text)) {
    return gunshotRaidContext(input.trainingLevel);
  }

  if (input.laneType === "mass-casualty" || /(mass casualty|multiple casualties|triage|secondary device)/.test(text)) {
    return massCasualtyBlastContext(input.trainingLevel);
  }

  if (input.laneType === "evacuation" || /(exfil|ccp|casevac|evac|hlz|movement to ccp)/.test(text)) {
    return exfilWoundContext(input.trainingLevel);
  }

  return breachBlastContext(input.trainingLevel);
}

export function isScenarioAlignedToContext(candidate: {
  moi: string;
  wound_set: { injuries: Array<{ label: string; type: string; region: string }> };
}, context: CasualtyContext) {
  const candidateText = `${candidate.moi} ${candidate.wound_set.injuries.map((injury) => `${injury.label} ${injury.type} ${injury.region}`).join(" ")}`.toLowerCase();
  const contextText = `${context.moi} ${context.injuries.map((injury) => `${injury.label} ${injury.type} ${injury.region}`).join(" ")}`.toLowerCase();

  const contextKeywords = extractKeywords(contextText);
  const overlap = contextKeywords.filter((keyword) => candidateText.includes(keyword));
  return overlap.length >= 2;
}

function breachBlastContext(trainingLevel?: TrainingLevel): CasualtyContext {
  return {
    profileId: "breach-blast",
    scenarioNameSuffix: "breach casualty",
    setting: "Objective breach lane with low light, dust, and interior room clearing pressure",
    moi: "Dismounted blast exposure at the breach with fragmentation to the lower body and blast overpressure effects",
    summary: "Casualty is injured at the breach point and remains in the fatal funnel long enough to force in-place treatment under security pressure.",
    openingLine: "Medic, blast got my leg. I'm hit low and getting dizzy.",
    chiefComplaint: "Severe upper leg pain, active bleeding, and painful breathing after blast exposure.",
    demeanor: trainingLevel === "ranger-medic" ? "Alert but deteriorating, responsive to commands, likely to decompensate if delayed." : "Anxious, responsive, trying to move despite injury.",
    answers: {
      what_happened: "Charge went off at the breach and I caught fragments low when I turned through the doorway.",
      where_does_it_hurt: "Upper leg first. My side and chest hurt when I breathe hard.",
      can_you_breathe: "I can talk, but deep breaths hurt.",
      are_you_bleeding: "Yes, leg is bleeding hard."
    },
    behaviorCues: [
      "Attempts to roll off the injured side",
      "Grabs the upper thigh when pain spikes",
      "Speech shortens if bleeding continues"
    ],
    injuries: [
      {
        label: "Upper thigh / groin junctional hemorrhage",
        region: "right proximal lower extremity",
        type: "fragmentation wound",
        severity: "severe",
        visible_findings: ["Bright red bleeding through trouser seam", "Pooling blood under hip", "Casualty guarding groin"],
        hidden_findings: ["Progressive shock if not rapidly controlled", "Bleeding may resume if packing is not reassessed"],
        expected_interventions: ["Control massive hemorrhage", "Initiate reassessment"],
        critical_errors: ["Delayed packing and pressure", "Failure to recheck bleeding after movement"]
      },
      {
        label: "Blast-related chest wall trauma",
        region: "right lateral chest",
        type: "blunt / fragmentation trauma",
        severity: "moderate",
        visible_findings: ["Guarded respirations", "Pain on deep inspiration", "Protecting right lower ribs"],
        hidden_findings: ["Respiratory fatigue with delay", "No initial open chest wound despite pain complaints"],
        expected_interventions: ["Support breathing", "Initiate reassessment"],
        critical_errors: ["Tunnel vision on bleed only", "Treating nonexistent open chest wound without assessment"]
      }
    ],
    constraints: ["Treat in place for first 60-90 seconds", "Security team cannot fully collapse onto casualty"],
    resources: ["IFAK", "litter", "radio", "one aid bag moving up from stack"]
  };
}

function gunshotRaidContext(trainingLevel?: TrainingLevel): CasualtyContext {
  return {
    profileId: "gunshot-raid",
    scenarioNameSuffix: "interior gunshot casualty",
    setting: "Interior room clearing lane with close-range small arms fire and constrained movement",
    moi: "Close-range gunshot wound during room clearance with penetrating trauma and rapid loss of combat effectiveness",
    summary: "Casualty is hit by small-arms fire after entry and must be treated in a confined interior space with unclear follow-on threat.",
    openingLine: "I'm hit in the chest and arm. I can't stay up.",
    chiefComplaint: "Chest pain, arm weakness, and worsening breathing after gunshot wound.",
    demeanor: trainingLevel === "ranger-first-responder" ? "Fearful but responsive, needs direct commands." : "Initially controlled, then agitated if breathing worsens.",
    answers: {
      what_happened: "Took a round when we cleared the interior corner.",
      where_does_it_hurt: "Chest and left arm. Breathing is getting worse.",
      can_you_breathe: "Not great. Feels tight on this side.",
      are_you_bleeding: "Yeah. Arm's wet and chest burns."
    },
    behaviorCues: [
      "Leans away from the injured side",
      "Uses one arm poorly",
      "Becomes more anxious as respirations increase"
    ],
    injuries: [
      {
        label: "Penetrating chest wound with respiratory compromise risk",
        region: "left anterior chest",
        type: "gunshot wound",
        severity: "severe",
        visible_findings: ["Single chest wound", "Increasing work of breathing", "Uneven chest rise may develop"],
        hidden_findings: ["May progress toward tension physiology", "Can look stable briefly before decompensating"],
        expected_interventions: scopeInterventions(trainingLevel, ["Seal chest wound", "Support breathing", "Perform needle decompression", "Perform finger thoracostomy"]),
        critical_errors: ["Ignoring respiratory trend", "Delaying decompression decision when signs appear"]
      },
      {
        label: "Upper extremity penetrating hemorrhage",
        region: "left upper arm",
        type: "gunshot wound",
        severity: "moderate",
        visible_findings: ["Steady dark bleeding from upper arm", "Weak grip on affected side"],
        hidden_findings: ["Ongoing blood loss if not controlled", "Functional impairment under stress"],
        expected_interventions: ["Control massive hemorrhage", "Initiate reassessment"],
        critical_errors: ["Failure to control extremity bleeding", "Failure to reassess pulse / function"]
      }
    ],
    constraints: ["Limited room to expose fully", "Threat area may not be fully secure"],
    resources: ["IFAK", "aid bag nearby", "room-lighting intermittent", "radio available through team lead"]
  };
}

function vehicleAmbushContext(trainingLevel?: TrainingLevel): CasualtyContext {
  return {
    profileId: "vehicle-ambush",
    scenarioNameSuffix: "mounted rollover casualty",
    setting: "Mounted movement lane following rollover or convoy ambush with difficult extrication",
    moi: "Vehicle rollover / blast-ambush combination with blunt trauma, pelvic risk, and delayed extraction",
    summary: "Casualty is injured during mounted movement and arrives with mixed blunt trauma and hemorrhage concerns under movement constraints.",
    openingLine: "Vehicle rolled. My hip and belly hurt. I feel sick.",
    chiefComplaint: "Pelvic / lower abdominal pain, leg pain, and worsening weakness after rollover.",
    demeanor: "Pale, nauseated, and increasingly still; less dramatic than a breach casualty but trending toward shock.",
    answers: {
      what_happened: "Truck rolled after the blast and I got crushed into the side.",
      where_does_it_hurt: "Pelvis, lower stomach, and left leg.",
      can_you_breathe: "I can, but everything hurts when I move.",
      are_you_bleeding: "Don't know where it's all coming from, but I feel bad."
    },
    behaviorCues: [
      "Minimal movement because motion increases pain",
      "Guarding lower abdomen and pelvis",
      "Nausea or repeated requests not to move"
    ],
    injuries: [
      {
        label: "Pelvic / lower abdominal crush-blast trauma",
        region: "pelvis and lower abdomen",
        type: "blunt trauma",
        severity: "severe",
        visible_findings: ["Lower abdominal tenderness", "Pain with leg movement", "Pale and diaphoretic appearance"],
        hidden_findings: ["Occult internal bleeding risk", "Shock progression with movement and delay"],
        expected_interventions: scopeInterventions(trainingLevel, ["Control massive hemorrhage", "Initiate reassessment", "Prepare casualty for movement", "Initiate blood transfusion"]),
        critical_errors: ["Failure to recognize occult shock", "Rough movement without reassessment"]
      },
      {
        label: "Lower extremity deformity / secondary bleed",
        region: "left lower extremity",
        type: "fracture with soft tissue injury",
        severity: "moderate",
        visible_findings: ["Leg deformity or pain", "Localized bleeding", "Refusal to bear weight"],
        hidden_findings: ["Pain-driven tachycardia", "Worsening shock if bleed is underestimated"],
        expected_interventions: ["Control massive hemorrhage", "Prepare casualty for movement", "Initiate reassessment"],
        critical_errors: ["Missing secondary bleeding source", "Ignoring movement sensitivity"]
      }
    ],
    constraints: ["Extrication limits exposure and positioning", "Movement decisions materially affect patient state"],
    resources: ["litter", "casualty blanket", "vehicle extraction team", "radio", "limited space for treatment"]
  };
}

function verticalFallContext(trainingLevel?: TrainingLevel): CasualtyContext {
  return {
    profileId: "vertical-fall",
    scenarioNameSuffix: "fall injury casualty",
    setting: "Vertical access or rooftop movement lane with fall-related trauma",
    moi: "Fall from height during assault movement causing orthopedic trauma and possible head injury",
    summary: "Casualty has a mechanism that should force spinal awareness, limb injury recognition, and shock assessment without defaulting to generic blast findings.",
    openingLine: "I fell hard. My leg's wrong and I can't focus.",
    chiefComplaint: "Leg deformity, pelvic/back pain, and intermittent confusion after fall.",
    demeanor: "Distracted, in pain, sometimes repetitive in answers.",
    answers: {
      what_happened: "I came off the wall and slammed on my side.",
      where_does_it_hurt: "Leg, hip, and back.",
      can_you_breathe: "Yeah, but it hurts to move.",
      are_you_bleeding: "Not a ton outside, but I feel bad."
    },
    behaviorCues: ["Repeats questions", "Protects leg and pelvis", "Winces sharply with movement"],
    injuries: [
      {
        label: "Femur / pelvic trauma after fall",
        region: "lower body",
        type: "blunt orthopedic trauma",
        severity: "severe",
        visible_findings: ["Leg shortening or deformity", "Pain with any movement", "Pale appearance"],
        hidden_findings: ["Occult blood loss", "Shock can be missed because external bleeding is limited"],
        expected_interventions: ["Initiate reassessment", "Prepare casualty for movement", "Control massive hemorrhage"],
        critical_errors: ["Ignoring shock because bleeding is not dramatic", "Moving casualty before reassessment"]
      },
      {
        label: "Mild traumatic brain injury concern",
        region: "head / neurologic",
        type: "closed head injury",
        severity: "moderate",
        visible_findings: ["Repetitive questioning", "Delayed response", "Headache complaint"],
        hidden_findings: ["Mental status may drift with time", "Can be overshadowed by orthopedic injury"],
        expected_interventions: ["Assess mental status", "Initiate reassessment"],
        critical_errors: ["Failure to trend mentation", "Focusing only on visible limb injury"]
      }
    ],
    constraints: ["Movement itself may worsen pain and confusion", "Scene geometry may limit packaging options"],
    resources: ["litter", "blanket", "rope or wall-side team", "aid bag depending on trainee level"]
  };
}

function exfilWoundContext(trainingLevel?: TrainingLevel): CasualtyContext {
  return {
    profileId: "exfil-wound",
    scenarioNameSuffix: "exfil casualty",
    setting: "Movement to CCP / HLZ lane with intermittent stops and reassessment on the move",
    moi: "Casualty wounded during exfil under fire with interventions that may fail during movement",
    summary: "Primary training problem is not only the initial wound but whether the medic reassesses and preserves treatment effectiveness during evacuation.",
    openingLine: "I'm getting worse while we're moving. Check the leg again.",
    chiefComplaint: "Previously treated wound is worsening during movement with dizziness and fatigue.",
    demeanor: "Fatigued, more cooperative than breach casualty, but progressively less interactive if reassessment is missed.",
    answers: {
      what_happened: "Got hit leaving the objective and now moving is making it worse.",
      where_does_it_hurt: "Leg and lower side. Everything's worse when we pick up.",
      can_you_breathe: "Breathing's okay until we move fast.",
      are_you_bleeding: "Feels wet again."
    },
    behaviorCues: ["More symptoms during movement", "Requests stops", "Declining voice volume over time"],
    injuries: [
      {
        label: "Previously packed lower extremity hemorrhage with movement failure risk",
        region: "lower extremity",
        type: "fragmentation wound",
        severity: "severe",
        visible_findings: ["Old dressing saturating", "Fresh blood after movement", "Increasing pallor"],
        hidden_findings: ["Intervention may partially fail under movement stress", "Shock trend if not reassessed"],
        expected_interventions: ["Initiate reassessment", "Control massive hemorrhage", "Prepare casualty for movement"],
        critical_errors: ["Failure to recheck packing after movement", "Assuming initial intervention still holds"]
      },
      {
        label: "Exertional respiratory fatigue",
        region: "respiratory",
        type: "secondary compromise",
        severity: "moderate",
        visible_findings: ["Faster breathing on movement", "Shorter answers", "Reduced tolerance for litter carry"],
        hidden_findings: ["SpO2 may drift downward during exertion", "Can signal overall decompensation"],
        expected_interventions: ["Support breathing", "Initiate reassessment"],
        critical_errors: ["No reassessment during movement halts", "Ignoring worsening fatigue"]
      }
    ],
    constraints: ["Care must continue during movement halts", "Packaging and reassessment are equally important"],
    resources: ["litter team", "radio", "blanket", "casualty straps", "limited treatment windows during movement"]
  };
}

function massCasualtyBlastContext(trainingLevel?: TrainingLevel): CasualtyContext {
  return {
    profileId: "mass-casualty-blast",
    scenarioNameSuffix: "mass-casualty primary patient",
    setting: "Post-blast triage lane with multiple competing casualties and security friction",
    moi: "Secondary device / blast event producing multiple casualties; this patient is the primary evaluative casualty",
    summary: "The training problem is prioritization: a visibly critical casualty must be treated while other casualties compete for attention.",
    openingLine: "Help me first. I can't stop this bleeding.",
    chiefComplaint: "Severe extremity bleeding with confusion and competing noise from nearby casualties.",
    demeanor: "Loud initially, then less responsive if not prioritized correctly.",
    answers: {
      what_happened: "Another blast hit while we were consolidating.",
      where_does_it_hurt: "Leg and arm. I feel like I'm fading.",
      can_you_breathe: "I can talk right now.",
      are_you_bleeding: "Yes. A lot."
    },
    behaviorCues: ["Competes with nearby casualty noise", "Can still follow commands if addressed directly", "Confusion rises if shock worsens"],
    injuries: [
      {
        label: "Severe extremity hemorrhage in triage environment",
        region: "lower extremity",
        type: "blast / fragmentation wound",
        severity: "severe",
        visible_findings: ["Obvious arterial bleeding", "Blood trail from casualty position", "Weakening voice"],
        hidden_findings: ["Needs priority despite distracting scene", "Shock progression if triage is delayed"],
        expected_interventions: ["Assign priority", "Control massive hemorrhage", "Initiate reassessment"],
        critical_errors: ["Incorrect triage priority", "Delay caused by scene distraction"]
      },
      {
        label: "Secondary upper extremity wound",
        region: "upper extremity",
        type: "fragmentation wound",
        severity: "moderate",
        visible_findings: ["Bleeding but not immediately life-threatening", "Pain with movement"],
        hidden_findings: ["May distract from the true life threat", "Requires later reassessment"],
        expected_interventions: ["Assign priority", "Initiate reassessment"],
        critical_errors: ["Treating lesser injury before life threat", "Failure to communicate triage rationale"]
      }
    ],
    constraints: ["Other casualties are present", "Triage choice is part of evaluation", "Security posture remains imperfect"],
    resources: ["multiple IFAKs", "single medic asset nearby", "limited litter availability", "radio"]
  };
}

function scopeInterventions(trainingLevel: TrainingLevel | undefined, interventions: string[]) {
  if (!trainingLevel) {
    return interventions;
  }

  if (trainingLevel === "ranger-first-responder") {
    return interventions.filter((item) => !/finger thoracostomy|txa|blood|surgical|io/i.test(item));
  }

  if (trainingLevel === "advanced-ranger-first-responder") {
    return interventions.filter((item) => !/surgical airway|blood transfusion/i.test(item));
  }

  return interventions;
}

function extractKeywords(text: string) {
  return ["blast", "gunshot", "vehicle", "fall", "pelvic", "chest", "hemorrhage", "triage", "movement", "thoracostomy"].filter((keyword) =>
    text.includes(keyword)
  );
}
