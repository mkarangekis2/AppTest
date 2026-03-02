type EventRow = {
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
    ts: event.ts,
    type: event.type,
    summary: JSON.stringify(event.payload_json)
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
    score_marks: marks.length
  };
}
