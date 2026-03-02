import { Vitals } from "@/lib/domain";

export function applyVitalsDelta(current: Vitals, delta: Omit<Vitals, "temp_c">): Vitals {
  return {
    ...current,
    hr: clamp(current.hr + delta.hr, 20, 240),
    rr: clamp(current.rr + delta.rr, 4, 60),
    spo2: clamp(current.spo2 + delta.spo2, 40, 100),
    bp_sys: clamp(current.bp_sys + delta.bp_sys, 40, 220),
    bp_dia: clamp(current.bp_dia + delta.bp_dia, 20, 140),
    pain_0_10: clamp(current.pain_0_10 + delta.pain_0_10, 0, 10)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
