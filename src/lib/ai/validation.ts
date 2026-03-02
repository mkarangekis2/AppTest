import { ConopAnalysisOutput, LiveSuggestionOutput } from "@/lib/domain";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateVitals(value: unknown, includeTemp: boolean): boolean {
  if (!isObject(value)) {
    return false;
  }

  const baseChecks =
    isNumber(value.hr) &&
    isNumber(value.rr) &&
    isNumber(value.spo2) &&
    isNumber(value.bp_sys) &&
    isNumber(value.bp_dia) &&
    isNumber(value.pain_0_10);

  return includeTemp ? baseChecks && isNumber(value.temp_c) : baseChecks;
}

export function validateConopAnalysisOutput(value: unknown): value is ConopAnalysisOutput {
  if (!isObject(value) || !isObject(value.operational_context) || !Array.isArray(value.scenario_candidates)) {
    return false;
  }

  if (
    typeof value.conop_summary !== "string" ||
    typeof value.operational_context.setting !== "string" ||
    !["low", "medium", "high"].includes(String(value.operational_context.time_pressure)) ||
    !isStringArray(value.operational_context.resources) ||
    !isStringArray(value.operational_context.constraints)
  ) {
    return false;
  }

  return value.scenario_candidates.every((candidate) => {
    if (
      !isObject(candidate) ||
      typeof candidate.scenario_name !== "string" ||
      typeof candidate.moi !== "string" ||
      !["basic", "intermediate", "advanced"].includes(String(candidate.difficulty)) ||
      !isObject(candidate.wound_set) ||
      !Array.isArray(candidate.wound_set.injuries) ||
      !isObject(candidate.patient_presentation) ||
      !isObject(candidate.patient_presentation.answers_to_common_questions) ||
      !isObject(candidate.vitals_model) ||
      !validateVitals(candidate.vitals_model.baseline, true) ||
      !Array.isArray(candidate.vitals_model.progression_rules) ||
      !isObject(candidate.rubric) ||
      !Array.isArray(candidate.rubric.critical_actions) ||
      !Array.isArray(candidate.rubric.scoring_dimensions) ||
      !isStringArray(candidate.missing_inputs) ||
      typeof candidate.training_only_disclaimer !== "string"
    ) {
      return false;
    }

    return true;
  });
}

export function validateLiveSuggestionOutput(value: unknown): value is LiveSuggestionOutput {
  if (
    !isObject(value) ||
    !["stable", "worsening", "critical"].includes(String(value.current_stage)) ||
    typeof value.recognized_medic_action !== "string" ||
    !isObject(value.suggested_patient_response) ||
    !isStringArray(value.suggested_patient_response.what_patient_does) ||
    !isStringArray(value.suggested_patient_response.proctor_verbatim_lines) ||
    typeof value.suggested_patient_response.tone !== "string" ||
    !isObject(value.suggested_state_transition) ||
    !["stable", "worsening", "critical"].includes(String(value.suggested_state_transition.to_stage)) ||
    !validateVitals(value.suggested_state_transition.vitals_delta, false) ||
    !isNumber(value.suggested_state_transition.apply_over_sec) ||
    typeof value.suggested_state_transition.reason !== "string" ||
    !isObject(value.scoring_suggestion) ||
    !["correct", "incorrect", "delayed", "missed", "info"].includes(String(value.scoring_suggestion.mark)) ||
    typeof value.scoring_suggestion.rubric_action !== "string" ||
    typeof value.scoring_suggestion.notes !== "string" ||
    !isStringArray(value.safety_notes) ||
    !isStringArray(value.missing_context)
  ) {
    return false;
  }

  return true;
}
