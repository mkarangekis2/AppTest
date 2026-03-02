import { ConopAnalysisOutput, LiveSuggestionOutput } from "@/lib/domain";

export function fallbackConopAnalysis(title: string, rawText: string): ConopAnalysisOutput {
  return {
    conop_summary: `${title}: ${rawText.slice(0, 180)}`,
    operational_context: {
      setting: "Field training lane",
      time_pressure: "high",
      resources: ["IFAK", "litter", "radio"],
      constraints: ["Training-only", "Instructor-controlled progression"]
    },
    scenario_candidates: [
      {
        scenario_name: `${title} casualty lane`,
        moi: "Dismounted blast exposure with secondary fragmentation",
        difficulty: "intermediate",
        wound_set: {
          injuries: [
            {
              label: "Right leg hemorrhage",
              region: "right lower extremity",
              type: "junctional/fragmentation wound",
              severity: "severe",
              visible_findings: ["Active bleeding", "Blood on trouser leg"],
              hidden_findings: ["Progressive shock if untreated"],
              expected_interventions: ["Massive hemorrhage control", "Reassessment"],
              critical_errors: ["Delayed hemorrhage control", "Failure to reassess"]
            }
          ]
        },
        patient_presentation: {
          demeanor: "Anxious but responsive",
          chief_complaint: "My leg is hit and I feel weak.",
          script_opening_line: "Medic, my leg is hit. I'm getting dizzy.",
          answers_to_common_questions: {
            what_happened: "Blast and fragments hit me when we moved past the wall.",
            where_does_it_hurt: "Mostly my right leg and lower side.",
            can_you_breathe: "I can talk, but breathing is fast.",
            are_you_bleeding: "Yes, my leg is bleeding."
          },
          behavior_cues: ["Grimacing", "Trying to grab the wounded leg"]
        },
        vitals_model: {
          stage: "stable",
          baseline: {
            hr: 112,
            rr: 24,
            spo2: 95,
            bp_sys: 108,
            bp_dia: 68,
            temp_c: 36.8,
            pain_0_10: 8
          },
          progression_rules: [
            {
              trigger: "Hemorrhage not controlled within first minute",
              allowed_transitions: [
                {
                  to_stage: "worsening",
                  delta: {
                    hr: 12,
                    rr: 4,
                    spo2: -2,
                    bp_sys: -10,
                    bp_dia: -6,
                    pain_0_10: 1
                  },
                  time_window_sec: 60,
                  notes: "Escalate if bleeding remains uncontrolled."
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
              notes: "Immediate action expected."
            }
          ],
          scoring_dimensions: [
            { name: "sequence", max_points: 5, notes: "Correct order of care." },
            { name: "speed", max_points: 5, notes: "Timely action under pressure." },
            { name: "accuracy", max_points: 5, notes: "Correct intervention selection." },
            { name: "reassessment", max_points: 5, notes: "Rechecks after intervention." }
          ]
        },
        missing_inputs: [],
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
      what_patient_does: ["Breathes rapidly", "Keeps pressure off injured leg"],
      proctor_verbatim_lines: ["I'm still bleeding and getting light-headed."],
      tone: "strained"
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
      reason: "No accepted intervention has been applied yet."
    },
    scoring_suggestion: {
      mark: "info",
      rubric_action: "Reassessment",
      notes: "Need explicit proctor confirmation before scoring."
    },
    safety_notes: ["Training-only scenario support. Proctor retains control."],
    missing_context: []
  };
}
