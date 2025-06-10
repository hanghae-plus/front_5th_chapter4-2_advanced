# 과제 체크포인트

## 배포링크 
https://front-5th-chapter4-2-advanced-hazel.vercel.app/

## 과제 요구사항

- [x] 배포 후 url 제출

- [x] API 호출 최적화(`Promise.all` 이해)

- [x] SearchDialog 불필요한 연산 최적화
- [x] SearchDialog 불필요한 리렌더링 최적화

- [x] 시간표 블록 드래그시 렌더링 최적화
- [x] 시간표 블록 드롭시 렌더링 최적화

## 과제 셀프회고

##  API 호출 최적화 – 중복 요청 제거 및 병렬 처리 개선

### 초기상황
```javascript
const fetchAllLectures = async () => await Promise.all([
  (console.log('API Call 1', performance.now()), await fetchMajors()),
  (console.log('API Call 2', performance.now()), await fetchLiberalArts()),
  (console.log('API Call 3', performance.now()), await fetchMajors()),
  (console.log('API Call 4', performance.now()), await fetchLiberalArts()),
  (console.log('API Call 5', performance.now()), await fetchMajors()),
  (console.log('API Call 6', performance.now()), await fetchLiberalArts()),
]);
```
초기 코드에서는 **동일한 API**(fetchMajors, fetchLiberalArts)를 await 키워드와 함께 **여러 번 중복 호출**하고 있었습니다.

```javascript
let majorsCache: Promise<AxiosResponse<Lecture[]>> | null = null;
let liberalArtsCache: Promise<AxiosResponse<Lecture[]>> | null = null;

const getCachedMajors = () => {
  if (!majorsCache) {
    console.log("전공 데이터 새로 요청", performance.now());
    majorsCache = fetchMajors();
  } else {
    console.log("전공 데이터 캐시 사용", performance.now());
  }
  return majorsCache;
};

const getCachedLiberalArts = () => {
  if (!liberalArtsCache) {
    console.log("교양 데이터 새로 요청", performance.now());
    liberalArtsCache = fetchLiberalArts();
  } else {
    console.log("교양 데이터 캐시 사용", performance.now());
  }
  return liberalArtsCache;
};

export const fetchAllLectures = async () => {
  console.log("API 호출 시작", performance.now());

  const promises = [
    getCachedMajors(), // 1번째 호출 시에만 실제 API 요청
    getCachedLiberalArts(), // 1번째 호출 시에만 실제 API 요청
    getCachedMajors(), // 캐시된 Promise 재사용
    getCachedLiberalArts(), // 캐시된 Promise 재사용
    getCachedMajors(), // 캐시된 Promise 재사용
    getCachedLiberalArts(), // 캐시된 Promise 재사용
  ];

  return await Promise.all(promises);
};
```
**처음 호출** 시에만 API를 요청하고, 이후에는 **같은 Promise를 캐시**하여 재사용하도록 변경하였습니다.

또한 **await를 각 호출 앞에서 제거**하고, **Promise.all()**로 병렬 처리 구현하였습니다.

<img width="564" alt="스크린샷 2025-06-06 오전 1 40 46" src="https://github.com/user-attachments/assets/e79f8dba-e4ae-468a-8f75-ff4246f8601e" />

### 📉 API 호출 시간
**199.89ms** → **136.60ms**로 약 **32%** 성능 개선


## 불필요한 연산 최적화

### 컴포넌트 분리
<img width="196" alt="스크린샷 2025-06-06 오전 1 55 48" src="https://github.com/user-attachments/assets/6574e155-8fcd-4636-b260-b85116cbfbe5" />

3주차 강의에서 **컴포넌트가 잘 분리되어 있어야 최적화가 쉬워진다**는 내용이 기억나 리팩토링을 다음과같이 먼저 진행하였습니다.

### 고비용 함수 최적화
```javascript
const getFilteredLectures = () => {
  const { query = "", credits, grades, days, times, majors } = searchOptions;
  return lectures
    .filter(/* 검색어 기준 필터 */)
    .filter(/* 학년 기준 필터 */)
    .filter(/* 전공 기준 필터 */)
    .filter(/* 학점 기준 필터 */)
    .filter(/* 요일 기준 필터 */)
    .filter(/* 시간 기준 필터 */);
};
```
학생이 신청 가능한 시간표의 갯수는 **25,677개** 입니다. 

따라서 **getFilteredLectures** 함수가 호출될 때마다 이 모든 데이터에 대해 **여러 단계의 filter 연산**을 수행하게 됩니다.

벌써부터 너무 연산이 많다는 생각이 들지 않나요? 이를 위해  고비용 연산 결과를 캐싱하는 **useMemo**를 활용했습니다:


```javascript
const filteredLectures = useMemo(() => {
  const { query = "", credits, grades, days, times, majors } = searchOptions;
  return lectures
    .filter(/* ... */)
    // ... 여러 필터 체인
}, [searchOptions, lectures]); 
```
이로인해 **searchOptions**나 **lectures**가 변경되지 않으면 필터링 작업을 다시 수행하지 않도록 변경

컴포넌트가 다른 이유로 리렌더링되어도 이미 계산된 결과를 재사용


## SearchDialog 최적화

### pagination 최적화
<img width="394" alt="스크린샷 2025-06-06 오전 2 23 17" src="https://github.com/user-attachments/assets/d99187b5-94d4-4add-9aed-3708edff95eb" />
<img width="778" alt="스크린샷 2025-06-06 오전 2 23 36" src="https://github.com/user-attachments/assets/9039186a-20e9-4d58-9580-220d79000394" />

제일 아래 스크롤에 도달하게 되면은 다음 페이지 과목을 새로 업데이트하게 되는데 불필요하게 이미 존재하는 **테이블 Row 데이터**와 **테이블 위의 컴포넌트**들이 **렌더링이 발생**하게 됩니다.

이를 위해 테이블을 기준으로 **SearchFilters**, **LectureTable**로 나눈후 
```javascript
          <VStack spacing={4} align="stretch">
            <SearchFilters
              searchOptions={searchOptions}
              allMajors={allMajors}
              onSearchOptionChange={handleSearchOptionChange}
            />
            <Text align="right">검색결과: {filteredLectures.length}개</Text>
            <LectureTable
              visibleLectures={visibleLectures}
              onAddSchedule={addSchedule}
              loaderRef={loaderRef}
              ref={loaderWrapperRef}
            />
          </VStack>
```
**useCallback**으로 핸들러 메모이제이션 + **React.memo**를 통해 컴포넌트 메모이제이션하여 최적화를 진행하였습니다.
```javascript
  const handleTimesChange = useCallback(
    (times: number[]) => {
      onSearchOptionChange("times", times);
    },
    [onSearchOptionChange]
  );

  const handleMajorsChange = useCallback(
    (majors: string[]) => {
      onSearchOptionChange("majors", majors);
    },
    [onSearchOptionChange]
  );
```

<img width="680" alt="스크린샷 2025-06-06 오전 2 37 57" src="https://github.com/user-attachments/assets/41189ca9-5aa9-4270-a2d0-c8201b723d88" />

<img width="929" alt="스크린샷 2025-06-06 오전 2 41 57" src="https://github.com/user-attachments/assets/748ac1ec-c9b9-4549-be6d-28f09076ce57" />

사진에서 보여지는 것처럼 **SearchFilters**와 **이전 컴포넌트들이 렌더링이 발생하지 않은것**을 확인할 수 있으며 성능개선이 이루어진것을 확인하실 수 있습니다.

---

### 전공데이터 최적화

**학년 또는 요일 CheckBox**를 누르게 되면은 수많은 전공 데이터들을 **다시 렌더링**하게 되는 문제가 발생합니다.
<img width="981" alt="스크린샷 2025-06-06 오전 2 50 50" src="https://github.com/user-attachments/assets/f24ecf4f-c26e-47b1-b292-4874f0ed740c" />


위와 마찬가지로 하나의 컴포넌트를 **3개**의 컴포넌트로 분리하여 **memo 작업**을 진행하였습니다.
```javascript
    <VStack spacing={4} align="stretch">
      <BasicSearchControls
        searchOptions={searchOptions}
        onSearchOptionChange={onSearchOptionChange}
      />

      {/* 시간 + 전공 */}
      <HStack spacing={4}>
        <TimeSelector
          times={searchOptions.times}
          onTimesChange={handleTimesChange}
        />

        <MajorSelector
          majors={searchOptions.majors}
          allMajors={allMajors}
          onMajorsChange={handleMajorsChange}
        />
      </HStack>
    </VStack>
```

<img width="451" alt="스크린샷 2025-06-06 오전 2 52 08" src="https://github.com/user-attachments/assets/0f086ec8-652e-43da-add2-6740d7655964" />

<img width="646" alt="스크린샷 2025-06-06 오전 2 53 59" src="https://github.com/user-attachments/assets/8a87ed2d-8537-40c2-ad68-5d1839b6751b" />


## DraggableSchedule 최적화

<img width="537" alt="스크린샷 2025-06-06 오전 3 12 56" src="https://github.com/user-attachments/assets/c92daf1b-bb80-4048-a79f-c0692d3824ce" />

드래그를 통해 수업을 옮기게 되면은 **다른 시간표 영역에서도 모두 리렌더링**이 발생하여 성능 저하가 발생합니다.

```
사용자가 수업을 드래그 → DndContext 상태 변경 → active.id 업데이트

DndContext 상태 변경
    ↓
모든 ScheduleTable 컴포넌트가 리렌더링 (useDndContext 때문에)
    ↓
각 ScheduleTable 내부의 모든 DraggableSchedule도 리렌더링
```

이전과 마찬가지로 **컴포넌트에 대한 분리**를 진행했으며, **schedules에 useMemo**를 사용해 의존성 변화가 없을때에는 기존값을 사용하도록 하여 불필요한 렌더링을 막았습니다.

```javascript
const scheduleItems = useMemo(() => 
  schedules.map((schedule, index) => ({
    key: `${schedule.lecture.id}-${schedule.day}-${schedule.range[0]}`,
    id: `${tableId}:${index}`,
    data: schedule,
    bg: colorMap[schedule.lecture.id],
    onDeleteButtonClick: () => onDeleteButtonClick?.({
      day: schedule.day,
      time: schedule.range[0],
    })
  }))
, [schedules, tableId, colorMap, onDeleteButtonClick]);
```

<img width="740" alt="스크린샷 2025-06-06 오전 3 14 44" src="https://github.com/user-attachments/assets/73356b26-13a3-496a-a511-902ed87c5fdc" />

<img width="632" alt="스크린샷 2025-06-06 오전 3 18 56" src="https://github.com/user-attachments/assets/9f27f715-ead4-4ef0-9397-7e85d624ccd5" />


