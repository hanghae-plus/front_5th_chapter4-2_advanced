## api 호출 최적화

### 기존 코드

```tsx
const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

const fetchAllLectures = async () =>
  await Promise.all([
    (console.log("API Call 1", performance.now()), await fetchMajors()),
    (console.log("API Call 2", performance.now()), await fetchLiberalArts()),
    (console.log("API Call 3", performance.now()), await fetchMajors()),
    (console.log("API Call 4", performance.now()), await fetchLiberalArts()),
    (console.log("API Call 5", performance.now()), await fetchMajors()),
    (console.log("API Call 6", performance.now()), await fetchLiberalArts()),
  ]);

useEffect(() => {
  const start = performance.now();
  console.log("API 호출 시작: ", start);
  fetchAllLectures().then((results) => {
    const end = performance.now();
    console.log("모든 API 호출 완료 ", end);
    console.log("API 호출에 걸린 시간(ms): ", end - start);
    setLectures(results.flatMap((result) => result.data));
  });
}, []);
```

### 문제점

- 기존 API 요청마다 모두 호출
- promise.all의 잘못된 사용(직렬 -> 병렬로 변경 필요)

### 해결방안

- API 요청을 캐싱
- promise.all이 병렬로 처리하게 변경 (기존에는 배열을 만들 때 await가 있어 직렬로 처리되었음, promise 객체를 그대로 넣어줘야 병렬로 처리됨)

### 개선 코드

```tsx
import { useCallback, useRef } from "react";
import { Lecture } from "./types";
import axios from "axios";

export const useLectureFetcher = () => {
  const majorsCacheRef = useRef<Lecture[] | null>(null);
  const liberalArtsCacheRef = useRef<Lecture[] | null>(null);

  const fetchMajors = useCallback(async () => {
    if (majorsCacheRef.current) {
      return majorsCacheRef.current;
    }
    const response = await axios.get<Lecture[]>("/schedules-majors.json");
    majorsCacheRef.current = response.data;
    return majorsCacheRef.current;
  }, []);

  const fetchLiberalArts = useCallback(async () => {
    if (liberalArtsCacheRef.current) {
      return liberalArtsCacheRef.current;
    }
    const response = await axios.get<Lecture[]>("/schedules-liberal-arts.json");
    liberalArtsCacheRef.current = response.data;
    return liberalArtsCacheRef.current;
  }, []);

  const fetchAllLectures = useCallback(async () => {
    return await Promise.all([
      (console.log("API Call 1", performance.now()), fetchMajors()),
      (console.log("API Call 2", performance.now()), fetchLiberalArts()),
      (console.log("API Call 3", performance.now()), fetchMajors()),
      (console.log("API Call 4", performance.now()), fetchLiberalArts()),
      (console.log("API Call 5", performance.now()), fetchMajors()),
      (console.log("API Call 6", performance.now()), fetchLiberalArts()),
    ]);
  }, [fetchMajors, fetchLiberalArts]);

  return { fetchAllLectures };
};
```

- useRef를 사용해 캐싱
- Promise.all에 promise 객체를 그대로 넣어줘 병렬처리 가능하도록 변경

## 불필요한 연산 최적화

### 기존 문제

- `getFilteredLectures` 함수에서 불필요한 연산이 발생(`parseSchedule` 함수 중복 실행)
- 컴포넌트가 리렌더링 될 때마다 함수가 실행되어 성능 저하

### 해결방안

- 조건문을 변경해 `parseSchedule` 함수를 중복 실행하지 않도록 함
- `useMemo`를 사용해 불필요한 연산 최소화
- 함수를 외부로 빼서 컴포넌트 생명주기와 분리
- 해당 함수의 결과값을 사용하는 변수들에 대해서도 `useMemo` 적용

### 개선 코드

```ts
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
```

```tsx
const filteredLectures = useMemo(() => {
  return getFilteredLectures(lectures, searchOptions);
}, [lectures, searchOptions]);

const lastPage = useMemo(() => {
  return Math.ceil(filteredLectures.length / PAGE_SIZE);
}, [filteredLectures]);

const visibleLectures = useMemo(() => {
  return filteredLectures.slice(0, page * PAGE_SIZE);
}, [filteredLectures, page]);

const allMajors = useMemo(() => {
  return [...new Set(lectures.map((lecture) => lecture.major))];
}, [lectures]);
```
