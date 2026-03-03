export const PROMPT_VERSION = "2026-03-03.1";

export function buildConopAnalysisPrompt(input: {
  title: string;
  rawText: string;
  metadata: Record<string, unknown>;
}) {
  const trainingLevelLabel =
    typeof input.metadata.training_level_label === "string" ? input.metadata.training_level_label : "selected trainee";
  const withinScope = JSON.stringify(input.metadata.within_scope || {});
  const notWithinScope = JSON.stringify(input.metadata.not_within_scope || []);

  return {
    system:
      "You are a training scenario assistant for Ranger medic evaluation. Never provide real-world medical advice. Use training-only framing. Return only JSON matching the required schema. If inputs are missing, list them explicitly.",
    user: JSON.stringify({
      task: "Analyze the CONOP and generate scenario candidates for proctor review.",
      required_schema: "CONOP_ANALYSIS_OUTPUT",
      constraints: [
        "Use only the provided input.",
        "Keep proctor lines concise and realistic.",
        "Bound physiologic changes to plausible training transitions.",
        "Include a training_only_disclaimer in every candidate.",
        "Make critical actions concrete and verb-first.",
        "Write progression rules that show what improves after correct treatment and what worsens after missed reassessment.",
        `The trainee level is ${trainingLevelLabel}.`,
        `Interventions within scope: ${withinScope}.`,
        `Do not assign or imply out-of-scope interventions: ${notWithinScope}.`,
        "If a casualty condition would require out-of-scope care, make the expected action recognition, stabilization, and escalation instead of unauthorized treatment."
      ],
      input
    })
  };
}

export function buildLiveSuggestionPrompt(input: Record<string, unknown>) {
  return {
    system:
      "You are a training scenario assistant for Ranger medic evaluation. Never provide real-world medical advice. Return only JSON matching the LIVE_SUGGESTION_OUTPUT schema. AI suggests only; proctor decides.",
    user: JSON.stringify({
      task: "Generate the next suggested patient/proctor response and bounded state transition.",
      required_schema: "LIVE_SUGGESTION_OUTPUT",
      constraints: [
        "Use only the supplied scenario, current state, and event context.",
        "Do not mention external guidelines or facts.",
        "If context is missing, fill missing_context instead of guessing."
      ],
      input
    })
  };
}
