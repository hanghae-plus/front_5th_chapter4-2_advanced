
## 과제 셀프회고

## (1) SearchDialog.tsx 개선 

### 1) API 호출 최적화
- Promise.all에 병렬적으로 처리하기 위해 await 제거
- 클로저 캐싱 활용
``` js
const createFetcherWithCache = () => {
  const cache = new Map();

  return (fetchFn: () => unknown, key: string) => {
    if (cache.has(key)) {
      return cache.get(key); // 캐시에서 가져옴
    }

    const fetchPromise = fetchFn(); // 캐시에 없으면 호툴
    cache.set(key, fetchPromise); // 캐시에 저장
    return fetchPromise;
  };
};

const fetcherWithCache = createFetcherWithCache();
```

|         API 호출 개선     |
|----------------------|
|<img width="891" alt="image" src="https://github.com/user-attachments/assets/5bf54cb0-fa90-4b37-bf87-e872cec107d8" />|

### 2) 불필요한 연산 개선
- useMemo 사용해서 filteredLectures가 lectures, searchOptions에 따라 변경되도록 개선, .filter체이닝을 개선하기 위해 조건별로 묶어서 처리
```js
  const filteredLectures = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return lectures.filter((lecture) => {
      const matchesQuery =
        lecture.title.toLowerCase().includes(normalizedQuery) ||
        lecture.id.toLowerCase().includes(normalizedQuery);

      const matchesGrade =
        grades.length === 0 || grades.includes(lecture.grade);

      const matchesMajor =
        majors.length === 0 || majors.includes(lecture.major);

      const matchesCredits = !credits || lecture.credits === String(credits);

      const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];

      const matchesDays =
        days.length === 0 || schedules.some((s) => days.includes(s.day));

      const matchesTimes =
        times.length === 0 ||
        schedules.some((s) => s.range.some((time) => times.includes(time)));

      return (
        matchesQuery &&
        matchesGrade &&
        matchesMajor &&
        matchesCredits &&
        matchesDays &&
        matchesTimes
      );
    });
  }, [lectures, searchOptions]);

```

### 3) 불필요한 렌더링 방지
- 조건 필터링 하는 옵션 (checkbox) 을 컴포넌트로 분리해 메모이제이션을 적용하여 불필요한 렌더링 방지

|       before       |       after       |
|------------|------------|
|<img width="1595" alt="image" src="https://github.com/user-attachments/assets/b306be5c-682b-4d28-94d6-2fb50ef4c227" />|<img width="1599" alt="image" src="https://github.com/user-attachments/assets/e89a09b9-bda8-4943-b35a-3a99e9b5e5a7" />|


## (2) DnD 시스템 개선

### 1) 드래그시 렌더링 최적화
- DraggableSchedule을 컴포넌트로 분리해서 메모이제이션 해주기
- ScheduleDndProvider의 위치를 변경, 기존에는 모든 테이블에 리렌더되었지만 단일 테이블에 ScheduleDndProvider 감싸주어 개선
```diff
-        <ScheduleDndProvider>
-            <ScheduleTables/>
-        </ScheduleDndProvider>
+       <ScheduleTables />
```
```diff
+        <ScheduleDndProvider>
                < ScheduleTable ...
+        </ScheduleDndProvider>
```

### 2) Drop을 했을 때 렌더링 최적화
- 테이블 내부에 있는 Grid 를 별도의 컴포넌트로 분리해 메모이제이션 해주어 dnd할 경우 리렌더 되지 않도록 개선
- schedulesMap에서 해당 테이블만 상태 변경할 수 있도록 개선

```diff
-    setSchedulesMap({
-      ...schedulesMap,
-      [tableId]: schedulesMap[tableId].map((targetSchedule, targetIndex) => {
-        if (targetIndex !== Number(index)) {
-          return { ...targetSchedule }
-        }
-        return {
-          ...targetSchedule,
-          day: DAY_LABELS[nowDayIndex + moveDayIndex],
-          range: targetSchedule.range.map(time => time + moveTimeIndex),
-        }
-      })
-    })
+    setSchedulesMap((prev) => {
+      prev[tableId][index] = {
+        ...prev[tableId][index],
+        day: DAY_LABELS[nowDayIndex + moveDayIndex],
+        range: prev[tableId][index].range.map((time) => time + moveTimeIndex),
+      };
+      return prev;
+    });
```
## (3) 최적화 결과 
https://github.com/user-attachments/assets/db191310-f199-4aff-823e-98202aaefc02
