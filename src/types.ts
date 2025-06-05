export interface Lecture {
  id: string;
  title: string;
  credits: string;
  major: string;
  schedule: string;
  grade: number;
}

export type Day = "월" | "화" | "수" | "목" | "금" | "토";

export interface Schedule {
  lecture: Lecture;
  day: Day;
  range: number[];
  room?: string;
}
