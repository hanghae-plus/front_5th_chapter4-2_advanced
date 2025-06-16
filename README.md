# 과제 체크포인트

## 과제 요구사항

- [x] 배포 후 url 제출 https://front-5th-chapter4-2-advanced-tau.vercel.app/
- [x] API 호출 최적화(`Promise.all` 이해)
- [x] SearchDialog 불필요한 연산 최적화
- [x] SearchDialog 불필요한 리렌더링 최적화
- [x] 시간표 블록 드래그시 렌더링 최적화
- [x] 시간표 블록 드롭시 렌더링 최적화

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


<!-- 과제에 대한 회고를 작성해주세요 -->

### 기술적 성장
<!-- 예시
- 새로 학습한 개념
- 기존 지식의 재발견/심화
- 구현 과정에서의 기술적 도전과 해결
-->

### 코드 품질
<!-- 예시
- 특히 만족스러운 구현
- 리팩토링이 필요한 부분
- 코드 설계 관련 고민과 결정
-->

### 학습 효과 분석
<!-- 예시
- 가장 큰 배움이 있었던 부분
- 추가 학습이 필요한 영역
- 실무 적용 가능성
-->

### 과제 피드백
<!-- 예시
- 과제에서 모호하거나 애매했던 부분
- 과제에서 좋았던 부분
-->

## 리뷰 받고 싶은 내용

<!--
피드백 받고 싶은 내용을 구체적으로 남겨주세요
모호한 요청은 피드백을 남기기 어렵습니다.

참고링크: https://chatgpt.com/share/675b6129-515c-8001-ba72-39d0fa4c7b62

모호한 요청의 예시)
- 코드 스타일에 대한 피드백 부탁드립니다.
- 코드 구조에 대한 피드백 부탁드립니다.
- 개념적인 오류에 대한 피드백 부탁드립니다.
- 추가 구현이 필요한 부분에 대한 피드백 부탁드립니다.

구체적인 요청의 예시)
- 현재 함수와 변수명을 보면 직관성이 떨어지는 것 같습니다. 함수와 변수를 더 명확하게 이름 지을 수 있는 방법에 대해 조언해주실 수 있나요?
- 현재 파일 단위로 코드가 분리되어 있지만, 모듈화나 계층화가 부족한 것 같습니다. 어떤 기준으로 클래스를 분리하거나 모듈화를 진행하면 유지보수에 도움이 될까요?
- MVC 패턴을 따르려고 했는데, 제가 구현한 구조가 MVC 원칙에 맞게 잘 구성되었는지 검토해주시고, 보완할 부분을 제안해주실 수 있을까요?
- 컴포넌트 간의 의존성이 높아져서 테스트하기 어려운 상황입니다. 의존성을 낮추고 테스트 가능성을 높이는 구조 개선 방안이 있을까요?
-->
