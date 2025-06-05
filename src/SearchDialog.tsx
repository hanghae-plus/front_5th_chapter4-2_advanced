import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import {
  Box,
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
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { useScheduleContext } from "./ScheduleContext.tsx";
import { Lecture } from "./types.ts";
import { parseSchedule } from "./utils.ts";
import axios from "axios";
import { DAY_LABELS } from "./constants.ts";
import LectureRow from "./LectureRow.tsx";
import TimeSlotCheckbox from "./TimeSlotCheckbox.tsx";
import MajorCheckbox from "./MajorCheckbox.tsx";

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
  credits?: number;
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

// 디바운스 Hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// API 호출 최적화: 클로저를 이용한 캐싱
const createCachedFetcher = () => {
  const cache = new Map<string, Promise<{ data: Lecture[] }>>();

  return {
    fetchMajors: () => {
      const key = "schedules-majors";
      if (!cache.has(key)) {
        console.log("API Call - Majors (첫 호출)", performance.now());
        cache.set(key, axios.get<Lecture[]>("/schedules-majors.json"));
      } else {
        console.log("캐시에서 Majors 데이터 반환", performance.now());
      }
      return cache.get(key)!;
    },

    fetchLiberalArts: () => {
      const key = "schedules-liberal-arts";
      if (!cache.has(key)) {
        console.log("API Call - Liberal Arts (첫 호출)", performance.now());
        cache.set(key, axios.get<Lecture[]>("/schedules-liberal-arts.json"));
      } else {
        console.log("캐시에서 Liberal Arts 데이터 반환", performance.now());
      }
      return cache.get(key)!;
    },
  };
};

const { fetchMajors, fetchLiberalArts } = createCachedFetcher();

// 🔥 Promise.all을 올바르게 사용하여 병렬 실행 + 중복 호출 제거
const fetchAllLectures = async () => {
  const results = await Promise.all([fetchMajors(), fetchLiberalArts()]);

  return results.flatMap((result) => result.data);
};

// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
const SearchDialog = memo(({ searchInfo, onClose }: Props) => {
  const { setSchedulesMap } = useScheduleContext();

  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);

  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebounce(inputValue, 300);

  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: "",
    grades: [],
    days: [],
    times: [],
    majors: [],
  });

  const searchCacheRef = useRef<Map<string, Lecture[]>>(new Map());

  // 불필요한 연산 방지: 필터링 로직 메모이제이션
  const getFilteredLectures = useCallback(() => {
    const start = performance.now();

    // 검색 조건을 키로 사용 (page 제외!)
    const cacheKey = JSON.stringify({
      query: searchOptions.query || "",
      credits: searchOptions.credits,
      grades: [...searchOptions.grades].sort(),
      days: [...searchOptions.days].sort(),
      times: [...searchOptions.times].sort(),
      majors: [...searchOptions.majors].sort(),
    });

    // 캐시된 결과가 있으면 즉시 반환
    if (searchCacheRef.current.has(cacheKey)) {
      const cached = searchCacheRef.current.get(cacheKey)!;
      console.log(`📦 캐시 사용: ${cached.length}개 결과 (0ms)`);
      return cached;
    }

    console.log(`새로운 검색 시작: ${cacheKey}`);

    const { query = "", credits, grades, days, times, majors } = searchOptions;

    const filtered = lectures
      .filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(query.toLowerCase()) ||
          lecture.id.toLowerCase().includes(query.toLowerCase())
      )
      .filter(
        (lecture) => grades.length === 0 || grades.includes(lecture.grade)
      )
      .filter(
        (lecture) => majors.length === 0 || majors.includes(lecture.major)
      )
      .filter(
        (lecture) => !credits || lecture.credits.startsWith(String(credits))
      )
      .filter((lecture) => {
        if (days.length === 0) {
          return true;
        }
        const schedules = lecture.schedule
          ? parseSchedule(lecture.schedule)
          : [];
        return schedules.some((s) => days.includes(s.day));
      })
      .filter((lecture) => {
        if (times.length === 0) {
          return true;
        }
        const schedules = lecture.schedule
          ? parseSchedule(lecture.schedule)
          : [];
        return schedules.some((s) =>
          s.range.some((time) => times.includes(time))
        );
      });

    // 결과를 캐시에 저장
    searchCacheRef.current.set(cacheKey, filtered);

    const end = performance.now();
    console.log(
      `새 검색 완료: ${filtered.length}개 결과 (${(end - start).toFixed(2)}ms)`
    );

    return filtered;
  }, [lectures, searchOptions]);

  // 메모이제이션으로 렌더링 시마다 재계산 방지
  const filteredLectures = useMemo(
    () => getFilteredLectures(),
    [getFilteredLectures]
  );

  const lastPage = useMemo(
    () => Math.ceil(filteredLectures.length / PAGE_SIZE),
    [filteredLectures.length]
  );

  const visibleLectures = useMemo(() => {
    const start = performance.now();
    const result = filteredLectures.slice(0, page * PAGE_SIZE);
    const end = performance.now();
    console.log(
      `📄 페이지 ${page}: ${result.length}개 표시 (${(end - start).toFixed(
        2
      )}ms)`
    );
    return result;
  }, [filteredLectures, page]);
  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures]
  );

  const changeSearchOption = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      setPage(1);
      setSearchOptions((prev) => ({ ...prev, [field]: value }));
      loaderWrapperRef.current?.scrollTo(0, 0);
    },
    []
  );

  // const addSchedule = (lecture: Lecture) => {
  //   if (!searchInfo) return;

  //   const { tableId } = searchInfo;

  //   const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
  //     ...schedule,
  //     lecture,
  //   }));

  //   setSchedulesMap((prev) => ({
  //     ...prev,
  //     [tableId]: [...prev[tableId], ...schedules],
  //   }));

  //   onClose();
  // };

  const addSchedule = useCallback(
    (lecture: Lecture) => {
      if (!searchInfo) return;

      const { tableId } = searchInfo;

      const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
        ...schedule,
        lecture,
      }));

      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: [...prev[tableId], ...schedules],
      }));

      onClose();
    },
    [searchInfo, setSchedulesMap, onClose]
  );

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
    },
    []
  );

  const handleCreditsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      changeSearchOption("credits", e.target.value);
    },
    [changeSearchOption]
  );

  const handleGradesChange = useCallback(
    (value: (string | number)[]) => {
      changeSearchOption("grades", value.map(Number));
    },
    [changeSearchOption]
  );

  const handleDaysChange = useCallback(
    (value: (string | number)[]) => {
      changeSearchOption("days", value as string[]);
    },
    [changeSearchOption]
  );

  const handleTimesChange = useCallback(
    (values: (string | number)[]) => {
      changeSearchOption("times", values.map(Number));
    },
    [changeSearchOption]
  );

  const handleMajorsChange = useCallback(
    (values: (string | number)[]) => {
      changeSearchOption("majors", values as string[]);
    },
    [changeSearchOption]
  );

  // 🔥 시간 태그 제거 핸들러 메모이제이션
  const removeTimeTag = useCallback(
    (time: number) => {
      changeSearchOption(
        "times",
        searchOptions.times.filter((v) => v !== time)
      );
    },
    [changeSearchOption, searchOptions.times]
  );

  // 🔥 전공 태그 제거 핸들러 메모이제이션
  const removeMajorTag = useCallback(
    (major: string) => {
      changeSearchOption(
        "majors",
        searchOptions.majors.filter((v) => v !== major)
      );
    },
    [changeSearchOption, searchOptions.majors]
  );

  useEffect(() => {
    const start = performance.now();
    console.log("API 호출 시작: ", start);
    fetchAllLectures().then((results) => {
      const end = performance.now();
      console.log("모든 API 호출 완료 ", end);
      console.log("API 호출에 걸린 시간(ms): ", end - start);
      setLectures(results);
    });
  }, []);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => Math.min(lastPage, prevPage + 1));
        }
      },
      { threshold: 0, root: $loaderWrapper }
    );

    observer.observe($loader);

    return () => observer.unobserve($loader);
  }, [lastPage]);

  //디바운스된 검색어가 변경될 때만 실제 검색 옵션 업데이트
  useEffect(() => {
    setSearchOptions((prev) => ({ ...prev, query: debouncedQuery }));
    setPage(1); // 검색어 변경 시 페이지 초기화
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, [debouncedQuery]);

  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
    setPage(1);
  }, [searchInfo]);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>검색어</FormLabel>
                <Input
                  placeholder="과목명 또는 과목코드"
                  value={inputValue}
                  onChange={handleQueryChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>학점</FormLabel>
                <Select
                  value={searchOptions.credits}
                  onChange={handleCreditsChange}
                >
                  <option value="">전체</option>
                  <option value="1">1학점</option>
                  <option value="2">2학점</option>
                  <option value="3">3학점</option>
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>학년</FormLabel>
                <CheckboxGroup
                  value={searchOptions.grades}
                  onChange={handleGradesChange}
                >
                  <HStack spacing={4}>
                    {[1, 2, 3, 4].map((grade) => (
                      <Checkbox key={grade} id={`grade-${grade}`} value={grade}>
                        {grade}학년
                      </Checkbox>
                    ))}
                  </HStack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel>요일</FormLabel>
                <CheckboxGroup
                  value={searchOptions.days}
                  onChange={handleDaysChange}
                >
                  <HStack spacing={4}>
                    {DAY_LABELS.map((day) => (
                      <Checkbox key={day} id={`day-${day}`} value={day}>
                        {day}
                      </Checkbox>
                    ))}
                  </HStack>
                </CheckboxGroup>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>시간</FormLabel>
                <CheckboxGroup
                  colorScheme="green"
                  value={searchOptions.times}
                  onChange={handleTimesChange}
                >
                  <Wrap spacing={1} mb={2}>
                    {searchOptions.times
                      .sort((a, b) => a - b)
                      .map((time) => (
                        <Tag
                          key={time}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                        >
                          <TagLabel>{time}교시</TagLabel>
                          <TagCloseButton onClick={() => removeTimeTag(time)} />
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
                    {TIME_SLOTS.map((timeSlot) => (
                      <TimeSlotCheckbox key={timeSlot.id} timeSlot={timeSlot} />
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel>전공</FormLabel>
                <CheckboxGroup
                  colorScheme="green"
                  value={searchOptions.majors}
                  onChange={handleMajorsChange}
                >
                  <Wrap spacing={1} mb={2}>
                    {searchOptions.majors.map((major) => (
                      <Tag
                        key={major}
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                      >
                        <TagLabel>{major.split("<p>").pop()}</TagLabel>
                        <TagCloseButton onClick={() => removeMajorTag(major)} />
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
                      <MajorCheckbox key={major} major={major} />
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
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
                <Table size="sm" variant="striped">
                  <Tbody>
                    {visibleLectures.map((lecture, index) => (
                      <LectureRow
                        key={`${lecture.id}-${index}`}
                        lecture={lecture}
                        onAddSchedule={addSchedule}
                      />
                    ))}
                  </Tbody>
                </Table>
                <Box ref={loaderRef} h="20px" />
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default SearchDialog;
