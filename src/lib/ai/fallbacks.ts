import { ConopAnalysisOutput, LiveSuggestionOutput } from "@/lib/domain";

export function fallbackConopAnalysis(title: string, rawText: string): ConopAnalysisOutput {
  return {
    conop_summary: `${title}: Dismounted assault element receives a blast casualty during a short-duration objective raid. Casualty remains responsive but is trending toward hemorrhagic shock without rapid intervention.`,
    operational_context: {
      setting: "Night raid objective breach lane with low ambient light, dust, and intermittent small-arms audio",
      time_pressure: "high",
      resources: ["IFAK", "litter", "radio", "casualty blanket", "headlamp", "limited security team"],
      constraints: [
        "Training-only",
        "Instructor-controlled progression",
        "Casualty must be treated in place for first 90 seconds",
        "Movement to CCP delayed until proctor authorizes"
      ]
    },
    scenario_candidates: [
      {
        scenario_name: `${title} raid-force casualty lane`,
        moi: "Dismounted blast exposure at compound breach with secondary fragmentation to leg and lower torso",
        difficulty: "intermediate",
        wound_set: {
          injuries: [
            {
              label: "Right upper leg junctional hemorrhage",
              region: "right lower extremity",
              type: "junctional/fragmentation wound",
              severity: "severe",
              visible_findings: [
                "Bright red bleeding soaking through trouser seam",
                "Blood pooling under right hip",
                "Casualty guarding the groin and upper thigh"
              ],
              hidden_findings: [
                "Progressive shock if untreated",
                "Transient improvement possible after effective packing and pressure"
              ],
              expected_interventions: ["Control massive hemorrhage", "Initiate reassessment"],
              critical_errors: ["Delayed hemorrhage control", "Inadequate wound packing", "Failure to reassess bleeding source"]
            },
            {
              label: "Blast-related chest wall pain without open chest wound",
              region: "right lower chest",
              type: "blunt / fragmentation trauma",
              severity: "moderate",
              visible_findings: ["Guarding right lower ribs", "Shallow respirations", "Pain with deep breath"],
              hidden_findings: ["Respiratory fatigue if not reassessed", "Breath sounds remain present initially"],
              expected_interventions: ["Support breathing", "Initiate reassessment"],
              critical_errors: ["Ignoring breathing complaints", "Overtreating absent findings without reassessment"]
            }
          ]
        },
        patient_presentation: {
          demeanor: "Alert, anxious, trying to stay in the fight, increasingly pale if bleeding is not controlled",
          chief_complaint: "My leg is torn up, I feel dizzy, and it hurts to breathe deep.",
          script_opening_line: "Medic, right leg's hit bad. I'm getting light-headed. Don't leave me here.",
          answers_to_common_questions: {
            what_happened: "Charge went off at the breach. I got thrown right and caught fragments low.",
            where_does_it_hurt: "Upper right leg first. Right side of my chest hurts when I breathe in.",
            can_you_breathe: "I can answer you, just can't get a full breath without pain.",
            are_you_bleeding: "Yeah. Leg is pouring and I feel it getting worse."
          },
          behavior_cues: [
            "Grimacing and trying to twist away from the wound",
            "Voice starts strong but becomes slower if hemorrhage continues",
            "Attempts to sit up unless directed to stay down"
          ]
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
        missing_inputs: rawText.trim() ? [] : ["Detailed raid route, CASEVAC distance, and friendly security posture were not provided."],
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
