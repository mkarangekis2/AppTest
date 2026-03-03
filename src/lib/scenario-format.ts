import { Vitals } from "@/lib/domain";

type Injury = {
  label: string;
  region: string;
  type: string;
  severity: "mild" | "moderate" | "severe";
  visible_findings: string[];
  hidden_findings: string[];
  expected_interventions: string[];
  critical_errors: string[];
};

type CriticalAction = {
  action: string;
  must_occur_by_sec: number;
  fail_if_missed: boolean;
  notes: string;
};

type ProgressionRule = {
  trigger: string;
  allowed_transitions: Array<{
    to_stage: "stable" | "worsening" | "critical";
    delta: Omit<Vitals, "temp_c">;
    time_window_sec: number;
    notes: string;
  }>;
};

export type ScenarioRecord = {
  moi: string;
  environment_json: Record<string, unknown>;
  wound_set_json: { injuries?: Injury[] };
  presentation_script_json: {
    demeanor?: string;
    chief_complaint?: string;
    script_opening_line?: string;
    answers_to_common_questions?: Record<string, string>;
    behavior_cues?: string[];
  };
  rubric_json: {
    critical_actions?: CriticalAction[];
    scoring_dimensions?: Array<{
      name: "sequence" | "speed" | "accuracy" | "reassessment";
      max_points: number;
      notes: string;
    }>;
  };
  vitals_model_json: {
    stage?: "stable" | "worsening" | "critical";
    baseline?: Vitals;
    progression_rules?: ProgressionRule[];
  };
};

export type TreatmentCard = {
  action: string;
  deadlineSec: number | null;
  failIfMissed: boolean;
  reason: string;
  visibleCues: string[];
  ifDone: string[];
  ifMissed: string[];
  stageEffects: Array<{
    label: string;
    toStage: "stable" | "worsening" | "critical";
    delta: Omit<Vitals, "temp_c">;
    timeWindowSec: number;
    notes: string;
  }>;
};

export function summarizeMission(context: Record<string, unknown>, moi: string) {
  const setting = stringValue(context.setting, "Training lane");
  const pressure = stringValue(context.time_pressure, "medium");
  const resources = arrayValue(context.resources);
  const constraints = arrayValue(context.constraints);

  return {
    setting,
    pressure,
    resources,
    constraints,
    missionBrief: `${setting}. ${moi}. Time pressure ${pressure}.`
  };
}

export function buildTreatmentCards(scenario: ScenarioRecord): TreatmentCard[] {
  const injuries = scenario.wound_set_json?.injuries || [];
  const criticalActions = scenario.rubric_json?.critical_actions || [];
  const rules = scenario.vitals_model_json?.progression_rules || [];

  return criticalActions.map((item) => {
    const matchingInjuries = injuries.filter((injury) =>
      injury.expected_interventions.some((intervention) => sameAction(intervention, item.action))
    );
    const matchingRules = rules.filter((rule) => actionRelated(rule.trigger, item.action));
    const positiveRules = matchingRules.flatMap((rule) =>
      rule.allowed_transitions
        .filter((transition) => transition.to_stage === "stable")
        .map((transition) => ({
          label: "If performed effectively",
          toStage: transition.to_stage,
          delta: transition.delta,
          timeWindowSec: transition.time_window_sec,
          notes: transition.notes
        }))
    );
    const negativeRules = matchingRules.flatMap((rule) =>
      rule.allowed_transitions
        .filter((transition) => transition.to_stage !== "stable")
        .map((transition) => ({
          label: "If delayed or missed",
          toStage: transition.to_stage,
          delta: transition.delta,
          timeWindowSec: transition.time_window_sec,
          notes: transition.notes
        }))
    );

    return {
      action: item.action,
      deadlineSec: item.must_occur_by_sec ?? null,
      failIfMissed: item.fail_if_missed,
      reason: item.notes,
      visibleCues: matchingInjuries.flatMap((injury) => injury.visible_findings),
      ifDone:
        positiveRules.length > 0
          ? positiveRules.map((rule) => `${rule.notes} ${compactVitalsDelta(rule.delta)}`)
          : ["No explicit improvement authored. Proctor should confirm local patient response manually."],
      ifMissed:
        negativeRules.length > 0
          ? negativeRules.map((rule) => `${rule.notes} ${compactVitalsDelta(rule.delta)}`)
          : matchingInjuries.flatMap((injury) => injury.critical_errors).slice(0, 2),
      stageEffects: [...positiveRules, ...negativeRules]
    };
  });
}

export function buildQuestionPrompts(script: ScenarioRecord["presentation_script_json"]) {
  const questions = script.answers_to_common_questions || {};
  return [
    { label: "Opening line", value: stringValue(script.script_opening_line, "No opening line authored.") },
    { label: "Chief complaint", value: stringValue(script.chief_complaint, "No chief complaint authored.") },
    { label: "What happened", value: stringValue(questions.what_happened, "No answer authored.") },
    { label: "Where does it hurt", value: stringValue(questions.where_does_it_hurt, "No answer authored.") },
    { label: "Can you breathe", value: stringValue(questions.can_you_breathe, "No answer authored.") },
    { label: "Are you bleeding", value: stringValue(questions.are_you_bleeding, "No answer authored.") }
  ];
}

export function compactVitalsDelta(delta: Omit<Vitals, "temp_c">) {
  const entries = [
    formatDelta("HR", delta.hr),
    formatDelta("RR", delta.rr),
    formatDelta("SpO2", delta.spo2),
    formatDelta("SBP", delta.bp_sys),
    formatDelta("DBP", delta.bp_dia),
    formatDelta("Pain", delta.pain_0_10)
  ].filter(Boolean);

  return entries.length ? `Vitals: ${entries.join(", ")}.` : "";
}

function formatDelta(label: string, value: number) {
  if (!value) {
    return "";
  }
  return `${label} ${value > 0 ? "+" : ""}${value}`;
}

function actionRelated(trigger: string, action: string) {
  const normalizedTrigger = normalize(trigger);
  const normalizedAction = normalize(action);
  return (
    normalizedTrigger.includes(normalizedAction) ||
    normalizedAction.includes(normalizedTrigger) ||
    normalizedTrigger.includes("hemorrhage") && normalizedAction.includes("hemorrhage") ||
    normalizedTrigger.includes("airway") && normalizedAction.includes("airway") ||
    normalizedTrigger.includes("reassessment") && normalizedAction.includes("reassessment")
  );
}

function sameAction(left: string, right: string) {
  return normalize(left) === normalize(right) || normalize(left).includes(normalize(right)) || normalize(right).includes(normalize(left));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
