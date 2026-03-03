type EventRow = {
  id?: string;
  ts: string;
  type: string;
  payload_json: Record<string, unknown>;
};

type Rubric = {
  critical_actions: Array<{
    action: string;
    must_occur_by_sec: number;
    fail_if_missed: boolean;
    notes: string;
  }>;
  scoring_dimensions: Array<{
    name: "sequence" | "speed" | "accuracy" | "reassessment";
    max_points: number;
    notes: string;
  }>;
};

export function buildAar(events: EventRow[]) {
  return events.map((event) => ({
    id: event.id || `${event.ts}-${event.type}`,
    ts: event.ts,
    type: event.type,
    summary: summarizeEvent(event)
  }));
}

export function scoreSession(events: EventRow[], rubric: Rubric, startedAt: string) {
  const startTime = new Date(startedAt).getTime();
  const actionEvents = events.filter((event) => event.type === "medic_action");
  const marks = events.filter((event) => event.type === "score_mark");

  const critical = rubric.critical_actions.map((item) => {
    const matched = actionEvents.find((event) => event.payload_json.action === item.action);
    const elapsedSec = matched ? Math.max(0, Math.round((new Date(matched.ts).getTime() - startTime) / 1000)) : null;
    const missed = elapsedSec === null;
    const delayed = elapsedSec !== null && elapsedSec > item.must_occur_by_sec;

    return {
      action: item.action,
      must_occur_by_sec: item.must_occur_by_sec,
      fail_if_missed: item.fail_if_missed,
      elapsed_sec: elapsedSec,
      status: missed ? "missed" : delayed ? "delayed" : "met"
    };
  });

  const baseScore = rubric.scoring_dimensions.reduce((sum, dimension) => sum + dimension.max_points, 0);
  const penalties = critical.reduce((sum, item) => {
    if (item.status === "missed") {
      return sum + 2;
    }
    if (item.status === "delayed") {
      return sum + 1;
    }
    return sum;
  }, 0);

  const markPenalty = marks.reduce((sum, event) => {
    const mark = event.payload_json.mark;
    if (mark === "incorrect" || mark === "missed") {
      return sum + 1;
    }
    return sum;
  }, 0);

  return {
    total_possible: baseScore,
    total_awarded: Math.max(0, baseScore - penalties - markPenalty),
    critical_actions: critical,
    score_marks: marks.length,
    mark_details: marks.map((event) => ({
      action: String(event.payload_json.rubric_action || ""),
      mark: String(event.payload_json.mark || ""),
      notes: String(event.payload_json.notes || "")
    })),
    remediation_points: critical
      .filter((item) => item.status !== "met")
      .map((item) =>
        item.status === "missed"
          ? `${item.action} was missed. Drill the recognition cues and execution sequence.`
          : `${item.action} was delayed. Rehearse faster recognition and decisive treatment selection.`
      )
  };
}

function summarizeEvent(event: EventRow) {
  if (event.type === "medic_action") {
    return `Medic action: ${String(event.payload_json.action || "unknown action")}`;
  }
  if (event.type === "score_mark") {
    return `Score mark: ${String(event.payload_json.rubric_action || "action")} -> ${String(event.payload_json.mark || "unmarked")}`;
  }
  if (event.type === "patient_change") {
    return `Patient change: ${String(event.payload_json.reason || "state updated")}`;
  }
  if (event.type === "ai_suggestion") {
    const suggestion = event.payload_json.suggestion as { recognized_medic_action?: string } | undefined;
    return `AI suggestion generated for ${suggestion?.recognized_medic_action || "current situation"}`;
  }
  if (event.type === "proctor_apply") {
    return "Proctor accepted an AI-driven patient transition.";
  }
  if (event.type === "proctor_override") {
    return "Proctor overrode an AI suggestion.";
  }
  if (event.type === "note") {
    return String(event.payload_json.note || event.payload_json.message || "Proctor note added.");
  }
  return JSON.stringify(event.payload_json);
}
