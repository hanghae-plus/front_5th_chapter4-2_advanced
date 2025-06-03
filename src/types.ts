export interface Lecture {
  id: string;
  title: string;
  credits: string;
  major: string;
  schedule: string;
  grade: number;
}

export interface Schedule {
  id?: string;
  lecture: Lecture
  day: string;
  range: number[]
  room?: string;
}
