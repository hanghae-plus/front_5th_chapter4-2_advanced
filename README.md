# 과제 체크포인트

## 과제 요구사항

- [x] 배포 후 url 제출
- [x] API 호출 최적화(`Promise.all` 이해)
- [x] SearchDialog 불필요한 연산 최적화
- [x] SearchDialog 불필요한 리렌더링 최적화
- [x] 시간표 블록 드래그시 렌더링 최적화
- [x] 시간표 블록 드롭시 렌더링 최적화

## 과제 셀프회고

### ☑️ 배포 URL

- https://anveloper.dev/front_5th_chapter4-2_advanced/

### ☑️ API 호출 최적화

- API 호출 최적화 전 속도
  ![Screenshot 2025-06-03 at 16 54 52](https://github.com/user-attachments/assets/af75e867-4ef2-4198-a03c-7e5624cc4741)

<details><summary><strong>axios.ts</strong> 👈🏻</summary>

```ts
import axios, { AxiosResponse } from "axios";

// 레포지토리 base URL 추가
const api = axios.create({
  baseURL: import.meta.env.BASE_URL,
});

// instance 캐싱 전략
const cache: Record<string, AxiosResponse<unknown>> = {};

const cacheGet = async <T = unknown>(url: string): Promise<AxiosResponse<T>> => {
  if (cache[url]) return cache[url] as AxiosResponse<T>;

  const response = await api.get<T>(url);
  cache[url] = response;
  return response;
};

export { api, cacheGet };

// interceptor 캐싱 전략, 미사용
type CachedWithTTL = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: AxiosResponse<any, any>;
  timestamp: number;
};

const cachedApi = axios.create({
  baseURL: import.meta.env.BASE_URL,
});

const cachedResponse: Record<string, CachedWithTTL> = {};
const CACHE_TTL = 5 * 1_000 * 60;

cachedApi.interceptors.request.use((config) => {
  const key = config.url ?? "";
  const cached = cachedResponse[key];

  if (cached) {
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (!isExpired) {
      config.headers["x-from-cache"] = "true";
      config.adapter = () => Promise.resolve(cached.response);
    } else {
      delete cachedResponse[key];
    }
  }
  return config;
});

api.interceptors.response.use((response) => {
  const key = response.config.url ?? "";

  if (response.config.headers["x-from-cache"] !== "true") {
    cachedResponse[key] = { response, timestamp: Date.now() };
  }

  return response;
});
```
</details>

- `axios instance` 에서 메모리 캐싱 전략 사용 후 속도
  ![Screenshot 2025-06-03 at 16 55 52](https://github.com/user-attachments/assets/1b61c189-bbe4-40e8-932b-6cc7c9cf4202)
  - 배포를 위한 `baseURL` 설정하다가, 올바른 `Promise.all` 사용법 개선 보다 먼저 캐싱을 구현
  - `Record<string, AxiosResponse<unknown>>`로 간단하게 메모리 캐싱 구현
  - 추가적으로 `axios.interceptors`를 이용해 만료시간을 포함한 캐싱전략을 구현하였으나, `interceptor` 수준의 데이터는 서버에서 캐싱하는 것이 아닐까 하여 적용하지 않음
  - 배열에 `await`가 남아있는 상태에서 캐싱으로 인해, 메모리에 저장된 값을 그대로 불러와 호출시점이 동일한 시간 값을 확인할 수 있음

<details><summary><strong>SearchDialog.tsx</strong> 👈🏻</summary>

```tsx
// instance 캐싱 전략 사용 axios instance 객체에서 메모리에 캐싱, interceptor도 가능할 것으로 보이지만.. 실제론 서버에서 해야할 일로 생각됨
const fetchMajors = () => cacheGet<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () => cacheGet<Lecture[]>("/schedules-liberal-arts.json");

// TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.
const fetchAllLectures = () => {
  // async await 제거, Promise.all은 Promise를 반환하고, async 또한 함수를 Promise로 반환해주기 위한 syntactic sugar
  return Promise.all([
    // await 제거, 배열 내에서 함수를 실행하는 것은 순차적으로 await없이 실행
    (console.log("API Call 1", performance.now()), fetchMajors()),
    (console.log("API Call 2", performance.now()), fetchLiberalArts()),
    (console.log("API Call 3", performance.now()), fetchMajors()),
    (console.log("API Call 4", performance.now()), fetchLiberalArts()),
    (console.log("API Call 5", performance.now()), fetchMajors()),
    (console.log("API Call 6", performance.now()), fetchLiberalArts()),
  ]);
};
```
</details>

- 올바른 `Promise.all` 사용 방법 적용
  ![Screenshot 2025-06-03 at 18 00 51](https://github.com/user-attachments/assets/c17f440d-ea41-45e8-8d37-5486a0a3efcb)
  - `Promise.all`의 배열 내에서 `await`로 기다리지 않고 모든 함수를 호출, `Promise.all`에서 한번에 비동기 대기 후 처리
  - `Promise.all`은  `Promise`를 반환하며, `async`도 `Promise`를 반환하는 `systactic sugar` 이기때문에 `async, await` 제거
  - 앞선 함수를 기다리지 않고 다음 함수를 바로 요청하기 때문에 호출 시간이 동일하고 호출에 걸린 시간이 감소
  - 이전 함수가 메모리에 저장되기 전에 다음 함수가 호출되기 때문에 과제의 `fetchAllLectures` 함수로는 캐싱이 의미가 없을 수 있음

### ☑️ SearchDialog 불필요한 연산 최적화

<details><summary><strong>SearchDialog.tsx</strong> 👈🏻</summary>

```tsx
  /* ... */
  // 과도한 filter 연산 부하, getFilteredLectures 대신 useMemo 사용
  const filteredLectures = useMemo(() => {
    const { query = "", credits, grades, days, times, majors } = searchOptions;
    return lectures
      .filter((lecture) => lecture.title.toLowerCase().includes(query.toLowerCase()) || lecture.id.toLowerCase().includes(query.toLowerCase()))
      .filter((lecture) => grades.length === 0 || grades.includes(lecture.grade))
      .filter((lecture) => majors.length === 0 || majors.includes(lecture.major))
      .filter((lecture) => !credits || lecture.credits.startsWith(String(credits)))
      .filter((lecture) => {
        if (days.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some((s) => days.includes(s.day));
      })
      .filter((lecture) => {
        if (times.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some((s) => s.range.some((time) => times.includes(time)));
      });
  }, [searchOptions, lectures]);

  const lastPage = useMemo(() => Math.max(1, Math.ceil(filteredLectures.length / PAGE_SIZE)), [filteredLectures]);
  const visibleLectures = useMemo(() => filteredLectures.slice(0, page * PAGE_SIZE), [filteredLectures, page]);
  const allMajors = useMemo(() => [...new Set(lectures.map((lecture) => lecture.major))], [lectures]);
  /* ... */
```
</details>

- 하위 컴포넌트로 하달되어 사용되는 값들은 `useMemo`로 감싸 연산을 최적화
-TODO: 시간표  추가로 띄운 다이얼로그에서 아무런 searchOptions를 수정하지 않은 상태에서 무한 스크롤이 동작하지 않는 오류가 있음
  - lastPage값을 1이상으로 지정해보았으나, 제대로 되지 않는 것으로 보임
 
### ☑️ SearchDialog 불필요한 리렌더링 최적화

<details><summary><strong>SearchDialog.tsx</strong> 👈🏻</summary>

```tsx
  /* ... */
  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <SearchInput searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
              <CreditsSelect searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
            </HStack>

            <HStack spacing={4}>
              <GradeCheckbox searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
              <DaysCheckbox searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
            </HStack>

            <HStack spacing={4}>
              <TimeCheckbox searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
              <MajorsCheckbox searchOptions={searchOptions} changeSearchOption={changeSearchOption} allMajors={allMajors} />
            </HStack>
            <Text align="right">검색결과: {filteredLectures.length}개</Text>
            <Box>
              <Table>
                <Thead>
                  <Tr>
                    <Th width="100px">과목코드</Th>
                    <Th width="50px">학년</Th>
                    <Th width="200px">과목명</Th>
                    <Th width="50px">학점</Th>
                    <Th width="150px">전공</Th>
                    <Th width="150px">시간</Th>
                    <Th width="80px"></Th>
                  </Tr>
                </Thead>
              </Table>

              <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
                <FixedVisibleLectures visibleLectures={visibleLectures} addSchedule={addSchedule} />
                <Box ref={loaderRef} h="20px" />
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
  /* ... */
```
</details>

- 기존 `selectOptions`를 조작하는 각각의 컴포넌트를 개별 컴포넌트로 변경하고, 상위가 리랜더링 되더라도 다른 컴포넌트에 영향이 없도록 memo로 반환함


<details><summary>SearchDialog.tsx > <strong>VisibleLectureTable </strong> 👈🏻</summary>

```tsx

const VisibleLectureTable = memo(({ visibleLectures, addSchedule }: { visibleLectures: Lecture[]; addSchedule: (lecture: Lecture) => void }) => {
  return (
    <Table size="sm" variant="striped">
      <Tbody>
        {visibleLectures.map((lecture, index) => (
          <LectureTr key={`${lecture.id}-${index}`} lecture={lecture} addSchedule={addSchedule} />
        ))}
      </Tbody>
    </Table>
  );
});

const LectureTr = memo(({ lecture, addSchedule }: { lecture: Lecture; addSchedule: (lecture: Lecture) => void }) => {
  const handleAddClick = useCallback(() => addSchedule(lecture), [addSchedule, lecture]);

  return (
    <Tr>
      <Td width="100px">{lecture.id}</Td>
      <Td width="50px">{lecture.grade}</Td>
      <Td width="200px">{lecture.title}</Td>
      <Td width="50px">{lecture.credits}</Td>
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
      <Td width="80px">
        <Button size="sm" colorScheme="green" onClick={handleAddClick}>
          추가
        </Button>
      </Td>
    </Tr>
  );
});

```
</details>

- 무한 스크롤로 인해 늘어나는 `Table` 에서 각각의 `Tr`을 `memo`로 최적화 `60ms 이하`

  ![Screenshot 2025-06-04 at 22 48 02](https://github.com/user-attachments/assets/6f3b65ec-593e-47bb-9097-0810a1bfd822)

### ☑️ 시간표 블록 드래그시 렌더링 최적화

<details><summary><strong>ScheduleContext.tsx 추가</strong> 👈🏻</summary>

```tsx
// 테이블별 local schedules Context 함수
type LocalScheduleContextType = {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick: (timeInfo: DayTime) => void;
  onDeleteButtonClick: (timeInfo: DayTime) => void;
};

const LocalScheduleContext = createContext<LocalScheduleContextType>({ tableId: "", schedules: [], onScheduleTimeClick: () => {}, onDeleteButtonClick: () => {} });

export const LocalScheduleProvider = ({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick, children }: PropsWithChildren<LocalScheduleContextType>) => {
  const contextValue = useMemo(
    () => ({
      tableId,
      schedules,
      onScheduleTimeClick,
      onDeleteButtonClick,
    }),
    [tableId, schedules, onScheduleTimeClick, onDeleteButtonClick]
  );
  return <LocalScheduleContext.Provider value={contextValue}>{children}</LocalScheduleContext.Provider>;
};

export const useLocalScheduleContext = () => {
  const context = useContext(LocalScheduleContext);
  if (context === undefined) {
    throw new Error("useLocalSchedule must be used within a LocalScheduleProvider");
  }
  return context;
};
```
</details>

<details><summary><strong>ScheduleTables.tsx</strong> 👈🏻</summary>

```tsx
/* ... */

export const ScheduleTables = () => {
  /* ... */
  const scheduleTableList = useMemo(() => Object.entries(schedulesMap), [schedulesMap]);

  // activeTableId는 tables 중 table 선택임으로 상위로 이동
  const dndContext = useDndContext();

  const getActiveTableId = () => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  };

  const activeTableId = getActiveTableId();

  /* ... */

  // 각각의 table 별 handler를 미리 선언해 다른 테이블에 영향이 없도록 수정
  const handlers = useMemo(
    () =>
      scheduleTableList.map(
        ([tableId]) =>
          ({
            handleAddClick: () => setSearchInfo({ tableId }),
            handleDuplicateClick: () =>
              setSchedulesMap((prev) => ({
                ...prev,
                [`schedule-${Date.now()}`]: [...prev[tableId]],
              })),
            handleDeleteClick: () =>
              setSchedulesMap((prev) => {
                const newMap = { ...prev };
                delete newMap[tableId];
                return newMap;
              }),
            handleScheduleTimeClick: (timeInfo: DayTime) =>
              setSearchInfo({ tableId, ...timeInfo }),
            handleDeleteButtonClick: ({ day, time }: DayTime) =>
              setSchedulesMap((prev) => ({
                ...prev,
                [tableId]: prev[tableId].filter(
                  (schedule) =>
                    schedule.day !== day || !schedule.range.includes(time)
                ),
              })),
          } as const)
      ),
    [setSchedulesMap, scheduleTableList]
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {scheduleTableList.map(([tableId, schedules], index) => (
          <TableWrapper
            key={tableId}
            tableId={tableId}
            index={index}
            schedules={schedules}
            isDeletable={disabledRemoveButton}
            isActive={tableId === activeTableId}
            {...handlers[index]}
          />
        ))}
      </Flex>
      <SearchDialog
        searchInfo={searchInfo}
        onClose={() => setSearchInfo(null)}
      />
    </>
  );
}
```
</details>


<details><summary><strong>TableWrapper</strong> 👈🏻</summary>

```tsx
const TableWrapper = memo(
  ({
    tableId,
    index,
    schedules,
    isDeletable,
    isActive,
    handleAddClick,
    handleDuplicateClick,
    handleDeleteClick,
    handleScheduleTimeClick,
    handleDeleteButtonClick,
  }: TableWrapperProps) => {
    return (
      <Stack width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={handleAddClick}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={handleDuplicateClick}>
              복제
            </Button>
            <Button
              colorScheme="green"
              isDisabled={isDeletable}
              onClick={handleDeleteClick}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <LocalScheduleProvider // table 별 Local Context API 로 재할당
          tableId={tableId}
          schedules={schedules}
          onScheduleTimeClick={handleScheduleTimeClick}
          onDeleteButtonClick={handleDeleteButtonClick}
        >
          <ScheduleTable key={`schedule-table-${index}`} isActive={isActive} />
        </LocalScheduleProvider>
      </Stack>
    );
  }
);
```
</details>

<details><summary><strong>ScheduleTable.tsx</strong> 👈🏻</summary>

```tsx
/* ... */

const ScheduleTable = memo(({ isActive = false }: { isActive: boolean }) => {
  const { tableId, schedules, onScheduleTimeClick, onDeleteButtonClick } = useLocalScheduleContext();
  const colorMap = useMemo(() => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
    return lectures.reduce((acc, id, idx) => {
      acc[id] = colors[idx % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [schedules]);

  const schedulesItems = useMemo(() => {
    return schedules.map((schedule, index) => (
      <DraggableSchedule
        key={`${schedule.lecture.title}-${index}`}
        id={`${tableId}:${index}`}
        data={schedule}
        bg={colorMap[schedule.lecture.id]}
        onDeleteButtonClick={() => onDeleteButtonClick({ day: schedule.day, time: schedule.range[0] })}
      />
    ));
  }, [schedules, tableId, colorMap, onDeleteButtonClick]);

  return (
    <Box position="relative" outline={isActive ? "5px dashed" : undefined} outlineColor="blue.300">
      <ScheduleTableGrid onScheduleTimeClick={onScheduleTimeClick} />
      {schedulesItems}
    </Box>
  );
});
```
</details>

- `ScheduleTables` 에서 `Stack` 컴포넌트를 `TableWrapper`로 분리, ScheduleTable도 셀과 하위 요소들은 `memo`로 인해 영향 없음
- `ScheduleTable` 을 `Local Context API` 환경으로 분리
- Props로 하달되는  `schedules` 와 `handlers`를 `ScheduleTables` 에서 `useMemo` 로 저장
- 다른 테이블과 관련있는 `dndContext` 함수는 `ScheduleTables`로 끌어 올리고, `activeTableId`와 같은 지를 `boolean`으로 하달

![스크린샷 2025-06-05 오전 8 53 43 1](https://github.com/user-attachments/assets/bf2bd5f2-7c8b-4cd1-82d7-0f08be1800ae)

- 움직이는 셀외에 다른 리랜더링 없음

### ☑️ 시간표 블록 드롭시 렌더링 최적화

- `DragStart`, `Drag` 이벤트 시에는 문제가 없으나, `DragEnd` 시에만 전체 셀까지 재랜더링 되는 현상이 있었음
- table에 하달되는 함수가 schedulesMap에 의해 재생성 되는  문제로, 객체 Map대신 string[]을  useMemo로 감싸서 사용
- 셀 그리드  에도 memo 적용
- dndContext를 다시 하위 table로 내리고, 대신에 ScheduleDndProvider를 전체가 아닌  table 별로 감쌈

<details><summary><strong>components/schedule-tables/index.tsx</strong> 👈🏻</summary>

```tsx
  // string Key 배열로 확인
  const tableKeys = useMemo(() => Object.keys(schedulesMap).map((tableId) => tableId), [schedulesMap]);

  // 각각의 table 별 handler를 미리 선언해 다른 테이블에 영향이 없도록 수정
  const handlers = useMemo(() => {
    return tableKeys.map(
      (tableId) =>
        [
          (timeInfo: DayTime) => setSearchInfo({ tableId, ...timeInfo }),
          ({ day, time }: DayTime) => {
            console.log(day, time, tableId);
            setSchedulesMap((prev) => ({
              ...prev,
              [tableId]: prev[tableId].filter((schedule) => schedule.day !== day || !schedule.range.includes(time)),
            }));
          },
        ] as const
    );
  }, [setSchedulesMap, tableKeys]);
```
</details>

<details><summary><strong>components/schedule-tables/table-wrapper.tsx</strong> 👈🏻</summary>

```tsx
/* ... */
export const TableWrapper = memo(
  ({
    tableId,
    index,
    isDeletable,
    schedules,
    setSearchInfo,
    handleScheduleTimeClick,
    handleDeleteButtonClick,
  }: TableWrapperProps) => {
    return (
      <ScheduleDndProvider>
        <Stack key={tableId} width="600px">
          <ScheduleTableHeader //
            tableId={tableId}
            index={index}
            isDisabled={isDeletable}
            setSearchInfo={setSearchInfo}
          />
          <LocalScheduleProvider // table 별 Local Context API 로 재할당
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            handleScheduleTimeClick={handleScheduleTimeClick}
            handleDeleteButtonClick={handleDeleteButtonClick}
          >
            <ScheduleTable key={`schedule-table-${index}`} />
          </LocalScheduleProvider>
        </Stack>
      </ScheduleDndProvider>
    );
  }
);
```
</details>

- 전체 셀이나 테이블의  액션 버튼이있는 헤더가 재랜더링되는 현상은 해결완료
- 드랍 이후에  다른 테이블의 schedule 단일로만 반짝하고  재랜더 되는 부분은  아직  남음



- popover가 불필요하게 랜더링 되는 부분이 계속 하이라이트  되어, isOpen으로 popover 트리거  변경

<details><summary><strong>components/schedule-tables/table-wrapper.tsx</strong> 👈🏻</summary>

```tsx
/* ... */
export const DraggableSchedule = memo(({ id, data, bg, onDeleteButtonClick, ...props }: DraggableScheduleProps) => {
  const { day, range, room, lecture } = data;
  const { attributes, setNodeRef, listeners, transform } = useDraggable({ id });
  const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
  const topIndex = range[0] - 1;
  const size = range.length;
  const [isOpen, setIsOpen] = useState(false);

  const Cell = (
    <Box
      position="absolute"
      left={`${120 + CellSize.WIDTH * leftIndex + 1}px`}
      top={`${40 + (topIndex * CellSize.HEIGHT + 1)}px`}
      width={CellSize.WIDTH - 1 + "px"}
      height={CellSize.HEIGHT * size - 1 + "px"}
      bg={bg}
      p={1}
      boxSizing="border-box"
      cursor="pointer"
      ref={setNodeRef}
      transform={CSS.Translate.toString(transform)}
      onClick={() => setIsOpen((p) => !p)}
      {...listeners}
      {...attributes}
      {...props}
    >
      <Text fontSize="sm" fontWeight="bold">
        {lecture.title}
      </Text>
      <Text fontSize="xs">{room}</Text>
    </Box>
  );
  if (!isOpen) return Cell;
  return (
    <Popover isOpen={isOpen}>
      <PopoverTrigger>{Cell}</PopoverTrigger>
      <PopoverContent onClick={(event) => event.stopPropagation()} onMouseLeave={() => setIsOpen(false)}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Text>강의를 삭제하시겠습니까?</Text>
          <Button colorScheme="red" size="xs" onClick={onDeleteButtonClick}>
            삭제
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});
```
</details>

https://github.com/user-attachments/assets/4c8ed174-286f-4679-a0cb-d5fa14b44b6f

- 최종적으로 개선된 드래그 앤 드랍 상태
 
<details><summary><strong>최종 리팩토링한 디렉토리 구조</strong> 👈🏻</summary>

![image](https://github.com/user-attachments/assets/5e4ec743-6587-4be3-b717-6a55e2912021)

</details>

## 리뷰 받고 싶은 내용

- 10주 간 고생많으셨습니다.😊
- 저는 다시 10주간 백엔드 하러 가보겠습니다...
