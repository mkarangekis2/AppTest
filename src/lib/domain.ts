export type Stage = "stable" | "worsening" | "critical";
export type Difficulty = "basic" | "intermediate" | "advanced";
export type TimePressure = "low" | "medium" | "high";
export type ScoreDimensionName = "sequence" | "speed" | "accuracy" | "reassessment";
export type ScoreMark = "correct" | "incorrect" | "delayed" | "missed" | "info";

export type Vitals = {
  hr: number;
  rr: number;
  spo2: number;
  bp_sys: number;
  bp_dia: number;
  temp_c: number;
  pain_0_10: number;
};

export type ConopAnalysisOutput = {
  conop_summary: string;
  operational_context: {
    setting: string;
    time_pressure: TimePressure;
    resources: string[];
    constraints: string[];
  };
  scenario_candidates: Array<{
    scenario_name: string;
    moi: string;
    difficulty: Difficulty;
    wound_set: {
      injuries: Array<{
        label: string;
        region: string;
        type: string;
        severity: "mild" | "moderate" | "severe";
        visible_findings: string[];
        hidden_findings: string[];
        expected_interventions: string[];
        critical_errors: string[];
      }>;
    };
    patient_presentation: {
      demeanor: string;
      chief_complaint: string;
      script_opening_line: string;
      answers_to_common_questions: {
        what_happened: string;
        where_does_it_hurt: string;
        can_you_breathe: string;
        are_you_bleeding: string;
      };
      behavior_cues: string[];
    };
    vitals_model: {
      stage: Stage;
      baseline: Vitals;
      progression_rules: Array<{
        trigger: string;
        allowed_transitions: Array<{
          to_stage: Stage;
          delta: Omit<Vitals, "temp_c">;
          time_window_sec: number;
          notes: string;
        }>;
      }>;
    };
    rubric: {
      critical_actions: Array<{
        action: string;
        must_occur_by_sec: number;
        fail_if_missed: boolean;
        notes: string;
      }>;
      scoring_dimensions: Array<{
        name: ScoreDimensionName;
        max_points: number;
        notes: string;
      }>;
    };
    missing_inputs: string[];
    training_only_disclaimer: string;
  }>;
};

export type LiveSuggestionOutput = {
  current_stage: Stage;
  recognized_medic_action: string;
  suggested_patient_response: {
    what_patient_does: string[];
    proctor_verbatim_lines: string[];
    tone: string;
  };
  suggested_state_transition: {
    to_stage: Stage;
    vitals_delta: Omit<Vitals, "temp_c">;
    apply_over_sec: number;
    reason: string;
  };
  scoring_suggestion: {
    mark: ScoreMark;
    rubric_action: string;
    notes: string;
  };
  safety_notes: string[];
  missing_context: string[];
};
