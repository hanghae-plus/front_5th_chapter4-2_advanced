import { SearchOption } from "./SearchDialog";
import { Lecture } from "./types";
import { parseSchedule } from "./utils";

export const getFilteredLectures = (
  lectures: Lecture[],
  searchOptions: SearchOption
) => {
  const { query = "", credits, grades, days, times, majors } = searchOptions;

  return lectures
    .filter(
      (lecture) =>
        lecture.title.toLowerCase().includes(query.toLowerCase()) ||
        lecture.id.toLowerCase().includes(query.toLowerCase())
    )
    .filter((lecture) => grades.length === 0 || grades.includes(lecture.grade))
    .filter((lecture) => majors.length === 0 || majors.includes(lecture.major))
    .filter(
      (lecture) => !credits || lecture.credits.startsWith(String(credits))
    )
    .filter((lecture) => {
      if (days.length === 0 && times.length === 0) {
        return true;
      }

      const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];

      const matchDay =
        days.length === 0 || schedules.some((s) => days.includes(s.day));

      const matchTime =
        times.length === 0 ||
        schedules.some((s) => s.range.some((time) => times.includes(time)));

      return matchDay && matchTime;
    });
};
