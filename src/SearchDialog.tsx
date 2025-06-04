import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
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
import { useScheduleContext } from "./ScheduleContext.tsx";
import { Lecture } from "./types.ts";
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

// ... existing API cache code ...

/**
 * API 호출 결과를 캐시
 * @returns {{
 *   fetchMajors: () => Promise<import("axios").AxiosResponse<Lecture[]>>,
 *   fetchLiberalArts: () => Promise<import("axios").AxiosResponse<Lecture[]>>
 * }}
 */
const createApiCache = () => {
  const cache = new Map<string, Promise<import("axios").AxiosResponse<Lecture[]>>>();

  return {
    fetchMajors: (): Promise<import("axios").AxiosResponse<Lecture[]>> => {
      if (!cache.has("majors")) {
        console.log("API Call - fetchMajors", performance.now());
        cache.set("majors", axios.get<Lecture[]>("/schedules-majors.json"));
      }
      return cache.get("majors")!;
    },

    fetchLiberalArts: (): Promise<import("axios").AxiosResponse<Lecture[]>> => {
      if (!cache.has("liberalArts")) {
        console.log("API Call - fetchLiberalArts", performance.now());
        cache.set("liberalArts", axios.get<Lecture[]>("/schedules-liberal-arts.json"));
      }
      return cache.get("liberalArts")!;
    },
  };
};

const apiCache = createApiCache();

// Promise.all을 정상적으로 병렬 실행하도록 수정
const fetchAllLectures = async () => {
  const start = performance.now();
  console.log("API 호출 시작: ", start);

  // 병렬로 실행되도록 수정 (await 제거)
  const results = await Promise.all([apiCache.fetchMajors(), apiCache.fetchLiberalArts()]);

  const end = performance.now();
  console.log("모든 API 호출 완료: ", end);
  console.log("API 호출에 걸린 시간(ms): ", end - start);

  return results;
};

// 강의 행 컴포넌트 - 개별 행의 불필요한 리렌더링 방지
const LectureRow = memo(
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
        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
        <Td width="80px">
          <Button size="sm" colorScheme="green" onClick={handleAddClick}>
            추가
          </Button>
        </Td>
      </Tr>
    );
  }
);

// 전공 체크박스 컴포넌트 - 개별 체크박스의 불필요한 리렌더링 방지
const MajorCheckbox = memo(
  ({
    major,
    isChecked,
    onToggle,
  }: {
    major: string;
    isChecked: boolean;
    onToggle: (major: string, checked: boolean) => void;
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggle(major, e.target.checked);
      },
      [major, onToggle]
    );

    return (
      <Box key={major}>
        <Checkbox size="sm" isChecked={isChecked} onChange={handleChange}>
          {major.replace(/<p>/gi, " ")}
        </Checkbox>
      </Box>
    );
  }
);

// 시간 슬롯 체크박스 컴포넌트 - 개별 체크박스의 불필요한 리렌더링 방지
const TimeSlotCheckbox = memo(
  ({
    timeSlot,
    isChecked,
    onToggle,
  }: {
    timeSlot: { id: number; label: string };
    isChecked: boolean;
    onToggle: (id: number, checked: boolean) => void;
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggle(timeSlot.id, e.target.checked);
      },
      [timeSlot.id, onToggle]
    );

    return (
      <Box key={timeSlot.id}>
        <Checkbox size="sm" isChecked={isChecked} onChange={handleChange}>
          {timeSlot.id}교시({timeSlot.label})
        </Checkbox>
      </Box>
    );
  }
);

const SearchDialog = ({ searchInfo, onClose }: Props) => {
  const { setSchedulesMap } = useScheduleContext();

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

  const filteredLectures = useMemo(() => {
    const { query = "", credits, grades, days, times, majors } = searchOptions;
    return lectures
      .filter(
        lecture =>
          lecture.title.toLowerCase().includes(query.toLowerCase()) ||
          lecture.id.toLowerCase().includes(query.toLowerCase())
      )
      .filter(lecture => grades.length === 0 || grades.includes(lecture.grade))
      .filter(lecture => majors.length === 0 || majors.includes(lecture.major))
      .filter(lecture => !credits || lecture.credits.startsWith(String(credits)))
      .filter(lecture => {
        if (days.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some(s => days.includes(s.day));
      })
      .filter(lecture => {
        if (times.length === 0) {
          return true;
        }
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some(s => s.range.some(time => times.includes(time)));
      });
  }, [lectures, searchOptions]);

  const lastPage = useMemo(() => Math.ceil(filteredLectures.length / PAGE_SIZE), [filteredLectures]);
  const visibleLectures = useMemo(() => filteredLectures.slice(0, page * PAGE_SIZE), [filteredLectures, page]);
  const allMajors = useMemo(() => [...new Set(lectures.map(lecture => lecture.major))], [lectures]);

  const changeSearchOption = useCallback((field: keyof SearchOption, value: SearchOption[typeof field]) => {
    setPage(1);
    setSearchOptions(prev => ({ ...prev, [field]: value }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  const addSchedule = useCallback(
    (lecture: Lecture) => {
      if (!searchInfo) return;

      const { tableId } = searchInfo;

      const schedules = parseSchedule(lecture.schedule).map(schedule => ({
        ...schedule,
        lecture,
      }));

      setSchedulesMap(prev => ({
        ...prev,
        [tableId]: [...prev[tableId], ...schedules],
      }));

      onClose();
    },
    [searchInfo, setSchedulesMap, onClose]
  );

  // 전공 체크박스 토글 핸들러
  const handleMajorToggle = useCallback(
    (major: string, checked: boolean) => {
      const newMajors = checked ? [...searchOptions.majors, major] : searchOptions.majors.filter(m => m !== major);
      changeSearchOption("majors", newMajors);
    },
    [searchOptions.majors, changeSearchOption]
  );

  // 시간 슬롯 체크박스 토글 핸들러
  const handleTimeSlotToggle = useCallback(
    (id: number, checked: boolean) => {
      const newTimes = checked ? [...searchOptions.times, id] : searchOptions.times.filter(t => t !== id);
      changeSearchOption("times", newTimes);
    },
    [searchOptions.times, changeSearchOption]
  );

  // ... existing useEffect hooks ...

  useEffect(() => {
    const start = performance.now();
    console.log("API 호출 시작: ", start);
    fetchAllLectures().then(results => {
      const end = performance.now();
      console.log("모든 API 호출 완료 ", end);
      console.log("API 호출에 걸린 시간(ms): ", end - start);
      setLectures(results.flatMap(result => result.data));
    });
  }, []);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(prevPage => Math.min(lastPage, prevPage + 1));
        }
      },
      { threshold: 0, root: $loaderWrapper }
    );

    observer.observe($loader);

    return () => observer.unobserve($loader);
  }, [lastPage]);

  useEffect(() => {
    setSearchOptions(prev => ({
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
                  value={searchOptions.query}
                  onChange={e => changeSearchOption("query", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>학점</FormLabel>
                <Select value={searchOptions.credits} onChange={e => changeSearchOption("credits", e.target.value)}>
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
                  onChange={value => changeSearchOption("grades", value.map(Number))}
                >
                  <HStack spacing={4}>
                    {[1, 2, 3, 4].map(grade => (
                      <Checkbox key={grade} value={grade}>
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
                  onChange={value => changeSearchOption("days", value as string[])}
                >
                  <HStack spacing={4}>
                    {DAY_LABELS.map(day => (
                      <Checkbox key={day} value={day}>
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
                <Wrap spacing={1} mb={2}>
                  {searchOptions.times
                    .sort((a, b) => a - b)
                    .map(time => (
                      <Tag key={time} size="sm" variant="outline" colorScheme="blue">
                        <TagLabel>{time}교시</TagLabel>
                        <TagCloseButton
                          onClick={() =>
                            changeSearchOption(
                              "times",
                              searchOptions.times.filter(v => v !== time)
                            )
                          }
                        />
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
                  {TIME_SLOTS.map(timeSlot => (
                    <TimeSlotCheckbox
                      key={timeSlot.id}
                      timeSlot={timeSlot}
                      isChecked={searchOptions.times.includes(timeSlot.id)}
                      onToggle={handleTimeSlotToggle}
                    />
                  ))}
                </Stack>
              </FormControl>

              <FormControl>
                <FormLabel>전공</FormLabel>
                <Wrap spacing={1} mb={2}>
                  {searchOptions.majors.map(major => (
                    <Tag key={major} size="sm" variant="outline" colorScheme="blue">
                      <TagLabel>{major.split("<p>").pop()}</TagLabel>
                      <TagCloseButton
                        onClick={() =>
                          changeSearchOption(
                            "majors",
                            searchOptions.majors.filter(v => v !== major)
                          )
                        }
                      />
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
                  {allMajors.map(major => (
                    <MajorCheckbox
                      key={major}
                      major={major}
                      isChecked={searchOptions.majors.includes(major)}
                      onToggle={handleMajorToggle}
                    />
                  ))}
                </Stack>
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
                        index={index}
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
};

export default SearchDialog;
