import { ConopAnalysisOutput, LiveSuggestionOutput } from "@/lib/domain";
import { inferCasualtyContext } from "@/lib/casualty-context";

export function fallbackConopAnalysis(title: string, rawText: string, metadata: Record<string, unknown> = {}): ConopAnalysisOutput {
  const context = inferCasualtyContext({ title, rawText, metadata });
  return {
    conop_summary: `${title}: ${context.summary}`,
    operational_context: {
      setting: context.setting,
      time_pressure: "high",
      resources: context.resources,
      constraints: context.constraints
    },
    scenario_candidates: [
      {
        scenario_name: `${title} ${context.scenarioNameSuffix}`,
        moi: context.moi,
        difficulty: "intermediate",
        wound_set: {
          injuries: context.injuries
        },
        patient_presentation: {
          demeanor: context.demeanor,
          chief_complaint: context.chiefComplaint,
          script_opening_line: context.openingLine,
          answers_to_common_questions: context.answers,
          behavior_cues: context.behaviorCues
        },
        vitals_model: {
          stage: "stable",
          baseline: {
            hr: 118,
            rr: 26,
            spo2: 94,
            bp_sys: 104,
            bp_dia: 66,
            temp_c: 36.8,
            pain_0_10: 8
          },
          progression_rules: [
            {
              trigger: "Control massive hemorrhage completed with effective wound packing and sustained pressure",
              allowed_transitions: [
                {
                  to_stage: "stable",
                  delta: {
                    hr: -10,
                    rr: -2,
                    spo2: 1,
                    bp_sys: 6,
                    bp_dia: 4,
                    pain_0_10: -1
                  },
                  time_window_sec: 45,
                  notes: "Bleeding visibly slows, casualty can answer questions more clearly, and skin color slightly improves."
                }
              ]
            },
            {
              trigger: "Hemorrhage not controlled within first minute",
              allowed_transitions: [
                {
                  to_stage: "worsening",
                  delta: {
                    hr: 14,
                    rr: 4,
                    spo2: -2,
                    bp_sys: -12,
                    bp_dia: -8,
                    pain_0_10: 1
                  },
                  time_window_sec: 60,
                  notes: "Bleeding continues through dressing, casualty becomes more restless, and responses shorten."
                }
              ]
            },
            {
              trigger: "Support breathing and reassessment completed after hemorrhage control",
              allowed_transitions: [
                {
                  to_stage: "stable",
                  delta: {
                    hr: -4,
                    rr: -3,
                    spo2: 2,
                    bp_sys: 2,
                    bp_dia: 2,
                    pain_0_10: -1
                  },
                  time_window_sec: 90,
                  notes: "Casualty settles, breathing becomes less shallow, and conversation becomes more coherent."
                }
              ]
            },
            {
              trigger: "No reassessment after initial intervention",
              allowed_transitions: [
                {
                  to_stage: "critical",
                  delta: {
                    hr: 18,
                    rr: 6,
                    spo2: -4,
                    bp_sys: -18,
                    bp_dia: -10,
                    pain_0_10: 1
                  },
                  time_window_sec: 120,
                  notes: "Missed continued hemorrhage leads to shock progression; casualty becomes confused and harder to direct."
                }
              ]
            }
          ]
        },
        rubric: {
          critical_actions: [
            {
              action: "Control massive hemorrhage",
              must_occur_by_sec: 60,
              fail_if_missed: true,
              notes: "Immediate junctional bleeding control is the decisive action in the lane."
            },
            {
              action: "Support breathing",
              must_occur_by_sec: 120,
              fail_if_missed: false,
              notes: "Recognize pain-limited respirations, expose and reassess, and avoid tunnel vision on bleeding alone."
            },
            {
              action: "Initiate reassessment",
              must_occur_by_sec: 180,
              fail_if_missed: true,
              notes: "Recheck hemorrhage control, mental status, and respiratory effort before movement."
            }
          ],
          scoring_dimensions: [
            { name: "sequence", max_points: 5, notes: "Hemorrhage before secondary complaints, then breathing and reassessment in order." },
            { name: "speed", max_points: 5, notes: "Critical actions performed inside the lane timing windows." },
            { name: "accuracy", max_points: 5, notes: "Interventions match actual findings and avoid treatment not supported by the scenario." },
            { name: "reassessment", max_points: 5, notes: "Medic revisits bleeding, breathing, and patient response after each major action." }
          ]
        },
        missing_inputs: rawText.trim() ? [] : ["Detailed route, casualty location, and support posture were not provided."],
        training_only_disclaimer: "Training use only. Not medical advice for real patients."
      }
    ]
  };
}

export function fallbackLiveSuggestion(currentStage: LiveSuggestionOutput["current_stage"]): LiveSuggestionOutput {
  return {
    current_stage: currentStage,
    recognized_medic_action: "Awaiting logged medic action",
    suggested_patient_response: {
      what_patient_does: [
        "Presses his shoulders into the ground and tries to protect the right leg",
        "Breathes in short guarded pulls",
        "Tracks the medic with anxious eye contact"
      ],
      proctor_verbatim_lines: [
        "Leg still feels wet. I'm getting fuzzy.",
        "Breathing's there, just hurts on the right side."
      ],
      tone: "strained, urgent, still responsive"
    },
    suggested_state_transition: {
      to_stage: currentStage === "critical" ? "critical" : "worsening",
      vitals_delta: {
        hr: 8,
        rr: 3,
        spo2: -1,
        bp_sys: -6,
        bp_dia: -4,
        pain_0_10: 1
      },
      apply_over_sec: 45,
      reason: "No accepted intervention has been applied yet, so the casualty continues to show blood loss and agitation."
    },
    scoring_suggestion: {
      mark: "info",
      rubric_action: "Initiate reassessment",
      notes: "Proctor should confirm whether the medic revisited hemorrhage and breathing after the first treatment."
    },
    safety_notes: ["Training-only scenario support. Proctor retains control."],
    missing_context: []
  };
}
