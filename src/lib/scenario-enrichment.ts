import { getMedicActionSet } from "@/lib/action-sets";
import { ConopAnalysisOutput, LaneType } from "@/lib/domain";

type ConopMetadata = Record<string, unknown>;

export function enrichConopAnalysis(
  analysis: ConopAnalysisOutput,
  conop: {
    title: string;
    rawText: string;
    metadata: ConopMetadata;
  }
): ConopAnalysisOutput {
  const laneType = normalizeLaneType(conop.metadata.lane_type);
  const actionSet = getMedicActionSet(laneType);
  const trainingLevelLabel =
    typeof conop.metadata.training_level_label === "string" && conop.metadata.training_level_label
      ? conop.metadata.training_level_label
      : "Ranger casualty lane";
  const medicalAssets = Array.isArray(conop.metadata.medical_assets)
    ? conop.metadata.medical_assets.filter((item): item is string => typeof item === "string")
    : [];

  return {
    ...analysis,
    operational_context: {
      ...analysis.operational_context,
      setting: ensureDetailedSetting(analysis.operational_context.setting, conop, actionSet.name),
      constraints: ensureArrayItems(analysis.operational_context.constraints, [
        "Training-only",
        "Instructor-controlled progression"
      ]),
      resources: ensureArrayItems(analysis.operational_context.resources, [...actionSet.emphasis, ...medicalAssets]),
      lane_type: actionSet.laneType,
      medic_action_set_name: actionSet.name,
      medic_action_set: actionSet.actions
    },
    scenario_candidates: analysis.scenario_candidates.map((candidate, index) => {
      const scenarioName = candidate.scenario_name || `${conop.title} lane ${index + 1}`;
      const injuries = candidate.wound_set.injuries.map((injury) => ({
        ...injury,
        visible_findings: ensureArrayItems(injury.visible_findings, [defaultVisibleFinding(injury.label, injury.region)]),
        hidden_findings: ensureArrayItems(injury.hidden_findings, [defaultHiddenFinding(injury.severity)]),
        expected_interventions: ensureArrayItems(
          injury.expected_interventions,
          actionSet.actions.filter((action) => action.toLowerCase().includes(keywordForInjury(injury.label, injury.type)))
        ),
        critical_errors: ensureArrayItems(injury.critical_errors, [`Failure to address ${injury.label.toLowerCase()}`])
      }));

      const openingLine =
        candidate.patient_presentation.script_opening_line ||
        `Medic, I'm hit. ${candidate.patient_presentation.chief_complaint || "I need help now."}`;

      const chiefComplaint =
        candidate.patient_presentation.chief_complaint ||
        injuries.map((injury) => injury.label).slice(0, 2).join(" and ");

      return {
        ...candidate,
        scenario_name: scenarioName,
        moi: candidate.moi || buildMoi(conop.rawText, actionSet.name),
        wound_set: { injuries },
        patient_presentation: {
          ...candidate.patient_presentation,
          demeanor: candidate.patient_presentation.demeanor || defaultDemeanor(candidate.difficulty, trainingLevelLabel),
          chief_complaint: chiefComplaint,
          script_opening_line: openingLine,
          answers_to_common_questions: {
            what_happened:
              candidate.patient_presentation.answers_to_common_questions.what_happened ||
              `We hit the objective and I caught it during the ${actionSet.name.toLowerCase()} phase.`,
            where_does_it_hurt:
              candidate.patient_presentation.answers_to_common_questions.where_does_it_hurt ||
              chiefComplaint,
            can_you_breathe:
              candidate.patient_presentation.answers_to_common_questions.can_you_breathe ||
              "I can answer you, but breathing takes effort.",
            are_you_bleeding:
              candidate.patient_presentation.answers_to_common_questions.are_you_bleeding ||
              "Yes. Check the obvious wounds first."
          },
          behavior_cues: ensureArrayItems(candidate.patient_presentation.behavior_cues, [
            "Tracks the medic's voice",
            "Changes tone if condition worsens",
            "Responds differently after effective treatment"
          ])
        },
        vitals_model: {
          ...candidate.vitals_model,
          progression_rules: normalizeProgressionRules(candidate.vitals_model.progression_rules, injuries, actionSet.actions)
        },
        rubric: {
          ...candidate.rubric,
          critical_actions: normalizeCriticalActions(candidate.rubric.critical_actions, injuries, actionSet.actions),
          scoring_dimensions: candidate.rubric.scoring_dimensions
        },
        missing_inputs: candidate.missing_inputs,
        training_only_disclaimer: candidate.training_only_disclaimer || "Training use only. Not medical advice for real patients."
      };
    })
  };
}

function normalizeLaneType(value: unknown): LaneType | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.toLowerCase().trim();
  if (
    normalized === "point-of-injury" ||
    normalized === "prolonged-field-care" ||
    normalized === "evacuation" ||
    normalized === "mass-casualty"
  ) {
    return normalized;
  }

  return undefined;
}

function normalizeCriticalActions(
  actions: ConopAnalysisOutput["scenario_candidates"][number]["rubric"]["critical_actions"],
  injuries: ConopAnalysisOutput["scenario_candidates"][number]["wound_set"]["injuries"],
  actionSet: string[]
) {
  const normalized = [...actions];
  for (const injury of injuries) {
    for (const intervention of injury.expected_interventions) {
      if (!normalized.some((action) => sameText(action.action, intervention))) {
        normalized.push({
          action: intervention,
          must_occur_by_sec: actionSet.indexOf(intervention) <= 1 ? 60 : 180,
          fail_if_missed: intervention.toLowerCase().includes("hemorrhage") || intervention.toLowerCase().includes("reassessment"),
          notes: `Expected for ${injury.label.toLowerCase()}.`
        });
      }
    }
  }

  return normalized;
}

function normalizeProgressionRules(
  rules: ConopAnalysisOutput["scenario_candidates"][number]["vitals_model"]["progression_rules"],
  injuries: ConopAnalysisOutput["scenario_candidates"][number]["wound_set"]["injuries"],
  actionSet: string[]
) {
  const nextRules = [...rules];
  if (!nextRules.some((rule) => rule.allowed_transitions.some((transition) => transition.to_stage === "stable"))) {
    const firstAction = actionSet[0] || "Control massive hemorrhage";
    nextRules.unshift({
      trigger: `${firstAction} completed effectively`,
      allowed_transitions: [
        {
          to_stage: "stable",
          delta: { hr: -8, rr: -2, spo2: 1, bp_sys: 6, bp_dia: 4, pain_0_10: -1 },
          time_window_sec: 45,
          notes: "Casualty becomes easier to direct and visible deterioration slows."
        }
      ]
    });
  }

  if (!nextRules.some((rule) => /reassessment/i.test(rule.trigger))) {
    nextRules.push({
      trigger: "No reassessment after initial intervention",
      allowed_transitions: [
        {
          to_stage: "worsening",
          delta: { hr: 10, rr: 3, spo2: -2, bp_sys: -10, bp_dia: -6, pain_0_10: 1 },
          time_window_sec: 120,
          notes: `Missed follow-up allows ${injuries[0]?.label.toLowerCase() || "the primary injury"} to progress.`
        }
      ]
    });
  }

  return nextRules;
}

function ensureDetailedSetting(setting: string, conop: { title: string; metadata: ConopMetadata }, actionSetName: string) {
  const unit = typeof conop.metadata.unit === "string" && conop.metadata.unit ? conop.metadata.unit : "Ranger element";
  const location = typeof conop.metadata.location === "string" && conop.metadata.location ? conop.metadata.location : "training objective";
  const trainingLevel =
    typeof conop.metadata.training_level_label === "string" && conop.metadata.training_level_label
      ? conop.metadata.training_level_label
      : "Ranger lane";
  return setting && setting !== "Field training lane"
    ? setting
    : `${unit} operating at ${location} during a ${trainingLevel.toLowerCase()} ${actionSetName.toLowerCase()} derived from ${conop.title}.`;
}

function buildMoi(rawText: string, actionSetName: string) {
  return rawText.trim()
    ? `Scenario derived from CONOP details during ${actionSetName.toLowerCase()}: ${rawText.slice(0, 120)}`
    : `Scenario event generated for ${actionSetName.toLowerCase()} conditions.`;
}

function defaultDemeanor(difficulty: string, trainingLevelLabel: string) {
  return difficulty === "advanced"
    ? `Initially coherent but degrades quickly if the ${trainingLevelLabel.toLowerCase()} misses key interventions.`
    : `Responsive, stressed, and reactive to the ${trainingLevelLabel.toLowerCase()} medic's commands.`;
}

function ensureArrayItems(items: string[], fallbacks: string[]) {
  const next = items.filter(Boolean);
  for (const fallback of fallbacks) {
    if (fallback && !next.some((item) => sameText(item, fallback))) {
      next.push(fallback);
    }
  }
  return next;
}

function defaultVisibleFinding(label: string, region: string) {
  return `${label} produces visible findings around ${region}.`;
}

function defaultHiddenFinding(severity: string) {
  return severity === "severe" ? "Condition worsens quickly if not managed." : "May worsen if not reassessed.";
}

function keywordForInjury(label: string, type: string) {
  const source = `${label} ${type}`.toLowerCase();
  if (source.includes("hemorrhage") || source.includes("bleed")) {
    return "hemorrhage";
  }
  if (source.includes("airway")) {
    return "airway";
  }
  if (source.includes("breath") || source.includes("chest")) {
    return "breath";
  }
  return source.split(" ")[0] || "reassessment";
}

function sameText(left: string, right: string) {
  return left.toLowerCase().trim() === right.toLowerCase().trim();
}
