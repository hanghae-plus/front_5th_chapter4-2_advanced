import { LectureWithLowerCased } from "./types";
import { parseSchedule } from "./utils";

interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

type FilterRule = (
  lecture: LectureWithLowerCased,
  searchOptions: SearchOption
) => boolean;

export const applyFilterIf = (
  condition: (options: SearchOption) => boolean,
  rule: FilterRule
): FilterRule => {
  return (lecture, options) => {
    if (!condition(options)) return true;
    return rule(lecture, options);
  };
};

export const queryFilter = applyFilterIf(
  (options) => !!options.query?.trim(),
  (lecture, options) => {
    const lowerQuery = options.query!.toLowerCase();
    return (
      lecture.lowerCasedTitle?.includes(lowerQuery) ||
      lecture.lowerCasedId?.includes(lowerQuery)
    );
  }
);

export const gradeFilter = applyFilterIf(
  (options) => options.grades.length > 0,
  (lecture, options) => options.grades.includes(lecture.grade)
);

export const majorFilter = applyFilterIf(
  (options) => options.majors.length > 0,
  (lecture, options) => options.majors.includes(lecture.major)
);

export const creditsFilter = applyFilterIf(
  (options) => !!options.credits,
  (lecture, options) => lecture.credits.startsWith(String(options.credits))
);

// parseSchedule 중복호출을 줄이기 위해 요일/시간 필터를 하나의 필터로 합침
export const scheduleFilter = applyFilterIf(
  (options) => options.days.length > 0 || options.times.length > 0,
  (lecture, options) => {
    const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];

    // 요일 체크
    if (options.days.length > 0) {
      const dayMatches = schedules.some((s) => options.days.includes(s.day));
      if (!dayMatches) return false;
    }

    // 시간 체크
    if (options.times.length > 0) {
      const timeMatches = schedules.some((s) =>
        s.range.some((time) => options.times.includes(time))
      );
      if (!timeMatches) return false;
    }

    return true;
  }
);

export const filterLectures = (
  lectures: LectureWithLowerCased[],
  searchOptions: SearchOption
): LectureWithLowerCased[] => {
  const filters = [
    queryFilter,
    gradeFilter,
    majorFilter,
    creditsFilter,
    scheduleFilter,
  ];

  return lectures.filter((lecture) =>
    filters.every((filter) => filter(lecture, searchOptions))
  );
};
