export interface Lecture {
  id: string;
  title: string;
  credits: string;
  major: string;
  schedule: string;
  grade: number;
}

export interface Schedule {
  lecture: Lecture;
  day: string;
  range: number[];
  room?: string;
}

export type DayTime = { day: string; time: number };

export interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

export type DialogChildProps = {
  searchOptions: SearchOption;
  changeSearchOption: (field: keyof SearchOption, value: SearchOption[typeof field]) => void;
};

export type SearchInfo = {
  tableId: string;
  day?: string;
  time?: number;
} | null;
