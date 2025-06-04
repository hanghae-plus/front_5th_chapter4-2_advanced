export const DAYS = ["월", "화", "수", "목", "금"] as const;
export const DAY_LABELS = ["월", "화", "수", "목", "금", "토"] as const;

export const TIMES = [
  { id: 1, label: "09:00~09:50" },
  { id: 2, label: "10:00~10:50" },
  { id: 3, label: "11:00~11:50" },
  { id: 4, label: "12:00~12:50" },
  { id: 5, label: "13:00~13:50" },
  { id: 6, label: "14:00~14:50" },
] as const;

export const CellSize = {
  WIDTH: 80,
  HEIGHT: 30,
};

export const 초 = 1000;
export const 분 = 60 * 초;
