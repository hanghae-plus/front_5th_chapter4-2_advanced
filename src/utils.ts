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

export const parseSchedule = (schedule: string) => {
  const schedules = schedule.split("<p>");
  return schedules.map((schedule) => {
    const reg = /^([가-힣])(\d+(~\d+)?)(.*)/;

    const [day] = schedule.split(/(\d+)/);

    const range = getTimeRange(schedule.replace(reg, "$2"));

    const room = schedule.replace(reg, "$4")?.replace(/\(|\)/g, "");

    return { day, range, room };
  });
};

//  클로저 기반의 캐시 유틸 함수
export function createCachedFetcher<T>(
  fetchFn: () => Promise<T>
): () => Promise<T> {
  let cache: T | null = null;
  let pending: Promise<T> | null = null;

  return async () => {
    if (cache !== null) return cache;
    if (pending !== null) return pending;

    pending = fetchFn().then((result) => {
      cache = result; // 캐시에 결과 저장
      pending = null; // pending 상태 초기화
      return result;
    });

    return pending;
  };
}
