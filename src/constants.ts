import { parseHnM } from "./utils.ts";
export const DAY_LABELS = ["월", "화", "수", "목", "금", "토"] as const;

export const CellSize = {
  WIDTH: 80,
  HEIGHT: 30,
};

export const 초 = 1000;
export const 분 = 60 * 초;

export const SCHEDULE_TIMES = [
  ...Array(18)
    .fill(0)
    .map((v, k) => v + k * 30 * 분)
    .map((v) => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`),

  ...Array(6)
    .fill(18 * 30 * 분)
    .map((v, k) => v + k * 55 * 분)
    .map((v) => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`),
] as const;
