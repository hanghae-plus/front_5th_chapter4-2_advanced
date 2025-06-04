import { Schedule } from "../types";

export const fill2 = (n: number) => `0${n}`.substr(-2);

export const parseHnM = (current: number) => {
  const date = new Date(current);
  return `${fill2(date.getHours())}:${fill2(date.getMinutes())}`;
};

const getTimeRange = (value: string): number[] => {
  const [start, end] = value.split("~").map(Number);
  if (end === undefined) return [start];
  return Array(end - start + 1)
    .fill(start)
    .map((v, k) => v + k);
};

// 기존 parseSchedule 함수 (ScheduleTable용)
export const parseScheduleOriginal = (schedule: string) => {
  const schedules = schedule.split("<p>");
  return schedules.map(schedule => {
    const reg = /^([가-힣])(\d+(~\d+)?)(.*)/;

    const [day] = schedule.split(/(\d+)/);

    const range = getTimeRange(schedule.replace(reg, "$2"));

    const room = schedule.replace(reg, "$4")?.replace(/\(|\)/g, "");

    return { day, range, room };
  });
};

// 새로운 parseSchedule 함수 (SearchDialog용)
export const parseSchedule = (schedule: string): Omit<Schedule, "lecture">[] => {
  const timeSlots: Omit<Schedule, "lecture">[] = [];

  // 정규식으로 요일, 시간 범위, 강의실을 매칭 - 토요일 포함, 실제 데이터 형식에 맞게 수정
  const matches = schedule.match(/([월화수목금토])(\d+~\d+)\(([^)]+)\)/g);

  if (!matches) return timeSlots;

  matches.forEach(match => {
    const [, day, timeRange, room] = match.match(/([월화수목금토])(\d+~\d+)\(([^)]+)\)/) || [];

    if (day && timeRange && room) {
      const [start, end] = timeRange.split("~").map(Number);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

      // 시간 범위 전체를 하나의 스케줄로 생성 (강의실 정보 포함)
      timeSlots.push({
        day,
        range,
        room,
      });
    }
  });

  return timeSlots;
};
