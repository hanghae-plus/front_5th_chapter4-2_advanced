export interface Lecture {
  id: string;
  title: string;
  credits: string;
  major: string;
  schedule: string;
  grade: number;
}

export interface LectureWithLowerCased extends Lecture {
  lowerCasedId: string;
  lowerCasedTitle: string;
}

export interface Schedule {
  lecture: Lecture;
  day: string;
  range: number[];
  room?: string;
}

export type ScheduleMap = Record<string, Schedule[]>;
