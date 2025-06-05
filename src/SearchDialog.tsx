import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
} from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { useScheduleDispatch } from "./ScheduleContext.tsx";
import { ApiResponse, Lecture, Schedule } from "./types.ts";
import { parseSchedule } from "./utils.ts";
import axios from "axios";
import { DAY_LABELS } from "./constants.ts";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: string;
}

const TIME_SLOTS = [
  { id: 1, label: "09:00~09:30" },
  { id: 2, label: "09:30~10:00" },
  { id: 3, label: "10:00~10:30" },
  { id: 4, label: "10:30~11:00" },
  { id: 5, label: "11:00~11:30" },
  { id: 6, label: "11:30~12:00" },
  { id: 7, label: "12:00~12:30" },
  { id: 8, label: "12:30~13:00" },
  { id: 9, label: "13:00~13:30" },
  { id: 10, label: "13:30~14:00" },
  { id: 11, label: "14:00~14:30" },
  { id: 12, label: "14:30~15:00" },
  { id: 13, label: "15:00~15:30" },
  { id: 14, label: "15:30~16:00" },
  { id: 15, label: "16:00~16:30" },
  { id: 16, label: "16:30~17:00" },
  { id: 17, label: "17:00~17:30" },
  { id: 18, label: "17:30~18:00" },
  { id: 19, label: "18:00~18:50" },
  { id: 20, label: "18:55~19:45" },
  { id: 21, label: "19:50~20:40" },
  { id: 22, label: "20:45~21:35" },
  { id: 23, label: "21:40~22:30" },
  { id: 24, label: "22:35~23:25" },
];

const PAGE_SIZE = 100;

// 개별 필터 컴포넌트들
const GradeFilter = React.memo(
  ({
    grades,
    onChange,
  }: {
    grades: number[];
    onChange: (grades: number[]) => void;
  }) => {
    const gradeCheckboxes = useMemo(
      () =>
        [1, 2, 3, 4].map((grade) => (
          <Checkbox
            key={grade}
            value={grade}
          >
            {grade}학년
          </Checkbox>
        )),
      [],
    );

    return (
      <FormControl>
        <FormLabel>학년</FormLabel>
        <CheckboxGroup
          value={grades}
          onChange={(value) => onChange(value.map(Number))}
        >
          <HStack spacing={4}>{gradeCheckboxes}</HStack>
        </CheckboxGroup>
      </FormControl>
    );
  },
);

const DayFilter = React.memo(
  ({
    days,
    onChange,
  }: {
    days: string[];
    onChange: (days: string[]) => void;
  }) => {
    const dayCheckboxes = useMemo(
      () =>
        DAY_LABELS.map((day) => (
          <Checkbox
            key={day}
            value={day}
          >
            {day}
          </Checkbox>
        )),
      [],
    );

    return (
      <FormControl>
        <FormLabel>요일</FormLabel>
        <CheckboxGroup
          value={days}
          onChange={(value) => onChange(value as string[])}
        >
          <HStack spacing={4}>{dayCheckboxes}</HStack>
        </CheckboxGroup>
      </FormControl>
    );
  },
);

const TimeFilter = React.memo(
  ({
    times,
    onChange,
  }: {
    times: number[];
    onChange: (times: number[]) => void;
  }) => {
    const timeSlotCheckboxes = useMemo(
      () =>
        TIME_SLOTS.map(({ id, label }) => (
          <Box key={id}>
            <Checkbox
              size="sm"
              value={id}
            >
              {id}교시({label})
            </Checkbox>
          </Box>
        )),
      [],
    );

    const removeTime = useCallback(
      (timeToRemove: number) => {
        onChange(times.filter((v) => v !== timeToRemove));
      },
      [times, onChange],
    );

    return (
      <FormControl>
        <FormLabel>시간</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={times}
          onChange={(values) => onChange(values.map(Number))}
        >
          <Wrap
            spacing={1}
            mb={2}
          >
            {times
              .sort((a, b) => a - b)
              .map((time) => (
                <Tag
                  key={time}
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                >
                  <TagLabel>{time}교시</TagLabel>
                  <TagCloseButton onClick={() => removeTime(time)} />
                </Tag>
              ))}
          </Wrap>
          <Stack
            spacing={2}
            overflowY="auto"
            h="100px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius={5}
            p={2}
          >
            {timeSlotCheckboxes}
          </Stack>
        </CheckboxGroup>
      </FormControl>
    );
  },
);

const MajorFilter = React.memo(
  ({
    majors,
    allMajors,
    onChange,
  }: {
    majors: string[];
    allMajors: string[];
    onChange: (majors: string[]) => void;
  }) => {
    const removeMajor = useCallback(
      (majorToRemove: string) => {
        onChange(majors.filter((v) => v !== majorToRemove));
      },
      [majors, onChange],
    );

    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={majors}
          onChange={(values) => onChange(values as string[])}
        >
          <Wrap
            spacing={1}
            mb={2}
          >
            {majors.map((major) => (
              <Tag
                key={major}
                size="sm"
                variant="outline"
                colorScheme="blue"
              >
                <TagLabel>{major.split("<p>").pop()}</TagLabel>
                <TagCloseButton onClick={() => removeMajor(major)} />
              </Tag>
            ))}
          </Wrap>
          <Stack
            spacing={2}
            overflowY="auto"
            h="100px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius={5}
            p={2}
          >
            {allMajors.map((major) => (
              <Box key={major}>
                <Checkbox
                  key={major}
                  size="sm"
                  value={major}
                >
                  {major.replace(/<p>/gi, " ")}
                </Checkbox>
              </Box>
            ))}
          </Stack>
        </CheckboxGroup>
      </FormControl>
    );
  },
);

// 테이블 행 컴포넌트 분리
const LectureTableRow = React.memo(
  ({
    lecture,
    index,
    onAddSchedule,
  }: {
    lecture: Lecture;
    index: number;
    onAddSchedule: (lecture: Lecture) => void;
  }) => {
    const handleAddClick = useCallback(() => {
      onAddSchedule(lecture);
    }, [lecture, onAddSchedule]);

    return (
      <Tr key={`${lecture.id}-${index}`}>
        <Td width="100px">{lecture.id}</Td>
        <Td width="50px">{lecture.grade}</Td>
        <Td width="200px">{lecture.title}</Td>
        <Td width="50px">{lecture.credits}</Td>
        <Td
          width="150px"
          dangerouslySetInnerHTML={{ __html: lecture.major }}
        />
        <Td
          width="150px"
          dangerouslySetInnerHTML={{ __html: lecture.schedule }}
        />
        <Td width="80px">
          <Button
            size="sm"
            colorScheme="green"
            onClick={handleAddClick}
          >
            추가
          </Button>
        </Td>
      </Tr>
    );
  },
);

// 테이블 바디 컴포넌트 분리
const LectureTableBody = React.memo(
  ({
    lectures,
    onAddSchedule,
  }: {
    lectures: Lecture[];
    onAddSchedule: (lecture: Lecture) => void;
  }) => {
    return (
      <Tbody>
        {lectures.map((lecture, index) => (
          <LectureTableRow
            key={`${lecture.id}-${index}`}
            lecture={lecture}
            index={index}
            onAddSchedule={onAddSchedule}
          />
        ))}
      </Tbody>
    );
  },
);

const memoizedFetching = (fn: () => Promise<ApiResponse<Lecture[]>>) => {
  const cache = new Map<string, Promise<ApiResponse<Lecture[]>>>();

  return () => {
    const key = fn.name || "default";

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = fn();
    cache.set(key, promise);

    promise.catch(() => {
      cache.delete(key);
    });

    return promise;
  };
};

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

const cachedFetchMajors = memoizedFetching(fetchMajors);
const cachedFetchLiberalArts = memoizedFetching(fetchLiberalArts);

const loggingAsync = (
  fn: () => Promise<ApiResponse<Lecture[]>>,
  index: number,
): Promise<ApiResponse<Lecture[]>> => {
  return fn().then((result) => {
    console.log(`API Call ${index}`, performance.now());
    return result;
  });
};

const fetchAllLectures = async () => {
  console.log("API 병렬 호출 시작", performance.now());

  const promises = [
    loggingAsync(cachedFetchMajors, 1),
    loggingAsync(cachedFetchLiberalArts, 2),
    loggingAsync(cachedFetchMajors, 3),
    loggingAsync(cachedFetchLiberalArts, 4),
    loggingAsync(cachedFetchMajors, 5),
    loggingAsync(cachedFetchLiberalArts, 6),
  ];

  return Promise.all(promises);
};

const SearchDialog = React.memo(({ searchInfo, onClose }: Props) => {
  const { addSchedulesToTable } = useScheduleDispatch();

  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);
  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: "",
    grades: [],
    days: [],
    times: [],
    majors: [],
  });

  // 디바운싱된 검색어
  const deferredQuery = useDeferredValue(searchOptions.query || "");

  const parseScheduleCacheRef = useRef(new WeakMap());

  const memoizedLectures = useMemo(() => {
    const cache = parseScheduleCacheRef.current;
    return lectures.map((lecture) => {
      if (!cache.has(lecture)) {
        cache.set(lecture, {
          ...lecture,
          parsedSchedule: lecture.schedule
            ? parseSchedule(lecture.schedule)
            : [],
        });
      }
      return cache.get(lecture);
    });
  }, [lectures]);

  // 순차적 필터링으로 최적화
  const queryFilteredLectures = useMemo(() => {
    return memoizedLectures.filter(
      (lecture) =>
        lecture.title.toLowerCase().includes(deferredQuery.toLowerCase()) ||
        lecture.id.toLowerCase().includes(deferredQuery.toLowerCase()),
    );
  }, [memoizedLectures, deferredQuery]);

  const gradeFilteredLectures = useMemo(() => {
    return queryFilteredLectures.filter(
      (lecture) =>
        searchOptions.grades.length === 0 ||
        searchOptions.grades.includes(lecture.grade),
    );
  }, [queryFilteredLectures, searchOptions.grades]);

  const majorFilteredLectures = useMemo(() => {
    return gradeFilteredLectures.filter(
      (lecture) =>
        searchOptions.majors.length === 0 ||
        searchOptions.majors.includes(lecture.major),
    );
  }, [gradeFilteredLectures, searchOptions.majors]);

  const creditFilteredLectures = useMemo(() => {
    return majorFilteredLectures.filter(
      (lecture) =>
        !searchOptions.credits ||
        lecture.credits.startsWith(searchOptions.credits),
    );
  }, [majorFilteredLectures, searchOptions.credits]);

  const dayFilteredLectures = useMemo(() => {
    return creditFilteredLectures.filter((lecture) => {
      if (searchOptions.days.length === 0) return true;
      return lecture.parsedSchedule.some((s: Schedule) =>
        searchOptions.days.includes(s.day),
      );
    });
  }, [creditFilteredLectures, searchOptions.days]);

  const filteredLectures = useMemo(() => {
    return dayFilteredLectures.filter((lecture) => {
      if (searchOptions.times.length === 0) return true;
      return lecture.parsedSchedule.some((s: Schedule) =>
        s.range.some((time: number) => searchOptions.times.includes(time)),
      );
    });
  }, [dayFilteredLectures, searchOptions.times]);

  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures],
  );

  // 필터링된 데이터 총 개수만 따로 메모화
  const filteredLecturesCount = useMemo(
    () => filteredLectures.length,
    [filteredLectures],
  );

  // 마지막 페이지 계산 (필터링 결과가 변경될 때만 재계산)
  const lastPage = useMemo(
    () => Math.ceil(filteredLecturesCount / PAGE_SIZE),
    [filteredLecturesCount],
  );

  // 보여질 강의들만 별도로 계산 (페이지가 변경될 때만 재계산)
  const visibleLectures = useMemo(() => {
    return filteredLectures.slice(0, page * PAGE_SIZE);
  }, [filteredLectures, page]);

  // 개별 change handler들
  const changeQuery = useCallback((query: string) => {
    setPage(1);
    setSearchOptions((prev) => ({ ...prev, query }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const changeCredits = useCallback((credits: string) => {
    setPage(1);
    setSearchOptions((prev) => ({ ...prev, credits: credits || undefined }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const changeGrades = useCallback((grades: number[]) => {
    setPage(1);
    setSearchOptions((prev) => ({ ...prev, grades }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const changeDays = useCallback((days: string[]) => {
    setPage(1);
    setSearchOptions((prev) => ({ ...prev, days }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const changeTimes = useCallback((times: number[]) => {
    setPage(1);
    setSearchOptions((prev) => ({ ...prev, times }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const changeMajors = useCallback((majors: string[]) => {
    setPage(1);
    setSearchOptions((prev) => ({ ...prev, majors }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const lastPageRef = useRef(lastPage);
  lastPageRef.current = lastPage;

  const addSchedule = useCallback(
    (lecture: Lecture) => {
      if (!searchInfo) return;

      const schedules = (
        lecture.schedule ? parseSchedule(lecture.schedule) : []
      ).map((schedule) => ({ ...schedule, lecture }));

      addSchedulesToTable(searchInfo.tableId, schedules);
      onClose();
    },
    [searchInfo, addSchedulesToTable, onClose],
  );

  const intersectionCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => {
          const currentLastPage = Math.ceil(filteredLecturesCount / PAGE_SIZE);
          return Math.min(currentLastPage, prevPage + 1);
        });
      }
    },
    [filteredLecturesCount],
  );

  useEffect(() => {
    const start = performance.now();
    console.log("API 호출 시작: ", start);
    fetchAllLectures().then((results) => {
      console.log(results);
      const end = performance.now();
      console.log("모든 API 호출 완료 ", end);
      console.log("API 호출에 걸린 시간(ms): ", end - start);
      setLectures(results.flatMap((result) => result.data));
    });
  }, []);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) return;

    const observer = new IntersectionObserver(intersectionCallback, {
      threshold: 0,
      root: $loaderWrapper,
    });

    observer.observe($loader);
    return () => observer.unobserve($loader);
  }, [intersectionCallback]);

  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
    setPage(1);
  }, [searchInfo]);

  return (
    <Modal
      isOpen={Boolean(searchInfo)}
      onClose={onClose}
      size="6xl"
    >
      <ModalOverlay />
      <ModalContent
        maxW="90vw"
        w="1000px"
      >
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack
            spacing={4}
            align="stretch"
          >
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>검색어</FormLabel>
                <Input
                  placeholder="과목명 또는 과목코드"
                  value={searchOptions.query}
                  onChange={(e) => changeQuery(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>학점</FormLabel>
                <Select
                  value={searchOptions.credits}
                  onChange={(e) => changeCredits(e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="1">1학점</option>
                  <option value="2">2학점</option>
                  <option value="3">3학점</option>
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <GradeFilter
                grades={searchOptions.grades}
                onChange={changeGrades}
              />
              <DayFilter
                days={searchOptions.days}
                onChange={changeDays}
              />
            </HStack>

            <HStack spacing={4}>
              <TimeFilter
                times={searchOptions.times}
                onChange={changeTimes}
              />
              <MajorFilter
                majors={searchOptions.majors}
                allMajors={allMajors}
                onChange={changeMajors}
              />
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

              <Box
                overflowY="auto"
                maxH="500px"
                ref={loaderWrapperRef}
              >
                <Table
                  size="sm"
                  variant="striped"
                >
                  <LectureTableBody
                    lectures={visibleLectures}
                    onAddSchedule={addSchedule}
                  />
                </Table>
                <Box
                  ref={loaderRef}
                  h="20px"
                />
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default SearchDialog;
