import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
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
import axios, { AxiosResponse } from "axios";
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

type LectureWithParsedSchedule = Lecture & {
  parsedSchedule: ReturnType<typeof parseSchedule>;
};

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

const MajorCheckboxItem = memo(
  ({
    value,
    label,
    isChecked,
    onChange,
  }: {
    value: string;
    label: string;
    isChecked: boolean;
    onChange: (value: string, checked: boolean) => void;
  }) => {
    return (
      <Box>
        <Checkbox
          size="sm"
          value={value}
          isChecked={isChecked}
          onChange={(e) => onChange(value, e.target.checked)}
        >
          {label}
        </Checkbox>
      </Box>
    );
  }
);

const TimeCheckboxItem = memo(
  ({
    id,
    label,
    isChecked,
    onChange,
  }: {
    id: number;
    label: string;
    isChecked: boolean;
    onChange: (id: number, checked: boolean) => void;
  }) => {
    return (
      <Box>
        <Checkbox
          size="sm"
          value={id}
          isChecked={isChecked}
          onChange={(e) => onChange(id, e.target.checked)}
        >
          {id}교시({label})
        </Checkbox>
      </Box>
    );
  }
);

const LectureRow = memo(
  ({
    lecture,
    onAddSchedule,
  }: {
    lecture: LectureWithParsedSchedule;
    onAddSchedule: (lecture: LectureWithParsedSchedule) => void;
  }) => {
    return (
      <Tr>
        <Td width="100px">{lecture.id}</Td>
        <Td width="50px">{lecture.grade}</Td>
        <Td width="200px">{lecture.title}</Td>
        <Td width="50px">{lecture.credits}</Td>
        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
        <Td
          width="150px"
          dangerouslySetInnerHTML={{ __html: lecture.schedule }}
        />
        <Td width="80px">
          <Button
            size="sm"
            colorScheme="green"
            onClick={() => onAddSchedule(lecture)}
          >
            추가
          </Button>
        </Td>
      </Tr>
    );
  }
);

const GradeCheckboxItem = memo(
  ({
    grade,
    isChecked,
    onChange,
  }: {
    grade: number;
    isChecked: boolean;
    onChange: (grade: number, checked: boolean) => void;
  }) => {
    return (
      <Checkbox
        value={grade}
        isChecked={isChecked}
        onChange={(e) => onChange(grade, e.target.checked)}
      >
        {grade}학년
      </Checkbox>
    );
  }
);

const DayCheckboxItem = memo(
  ({
    day,
    isChecked,
    onChange,
  }: {
    day: string;
    isChecked: boolean;
    onChange: (day: string, checked: boolean) => void;
  }) => {
    return (
      <Checkbox
        value={day}
        isChecked={isChecked}
        onChange={(e) => onChange(day, e.target.checked)}
      >
        {day}
      </Checkbox>
    );
  }
);

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

// TODO: 이 코드를 개선해서 API 호출을 최소화 해보세요 + Promise.all이 현재 잘못 사용되고 있습니다. 같이 개선해주세요.
// 캐시를 위한 클로저 생성
const createMemoizedFetch = () => {
  let majorsPromise: Promise<AxiosResponse<Lecture[]>> | null = null;
  let liberalArtsPromise: Promise<AxiosResponse<Lecture[]>> | null = null;

  const getMajors = () => {
    if (!majorsPromise) {
      majorsPromise = fetchMajors();
    }
    return majorsPromise;
  };

  const getLiberalArts = () => {
    if (!liberalArtsPromise) {
      liberalArtsPromise = fetchLiberalArts();
    }
    return liberalArtsPromise;
  };

  return { getMajors, getLiberalArts };
};

const { getMajors, getLiberalArts } = createMemoizedFetch();

const fetchAllLectures = async () =>
  await Promise.all([
    (console.log("API Call 1", performance.now()), getMajors()),
    (console.log("API Call 2", performance.now()), getLiberalArts()),
    (console.log("API Call 3", performance.now()), getMajors()),
    (console.log("API Call 4", performance.now()), getLiberalArts()),
    (console.log("API Call 5", performance.now()), getMajors()),
    (console.log("API Call 6", performance.now()), getLiberalArts()),
  ]);

// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
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

  // 미리 파싱해서 캐싱
  const lecturesWithParsedSchedule = useMemo(
    () =>
      lectures.map((lectures) => ({
        ...lectures,
        parsedSchedule: lectures.schedule
          ? parseSchedule(lectures.schedule)
          : [],
      })),
    [lectures]
  );

  const { query = "", credits, grades, days, times, majors } = searchOptions;
  const filteredLectures = useMemo(() => {
    return lecturesWithParsedSchedule
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
      .filter(
        (lecture) =>
          days.length === 0 ||
          lecture.parsedSchedule.some((s) => days.includes(s.day))
      )
      .filter(
        (lecture) =>
          times.length === 0 ||
          lecture.parsedSchedule.some((s) =>
            s.range.some((time) => times.includes(time))
          )
      );
  }, [lecturesWithParsedSchedule, query, credits, grades, days, times, majors]);

  const lastPage = useMemo(
    () => Math.ceil(filteredLectures.length / PAGE_SIZE),
    [filteredLectures]
  );

  const visibleLectures = useMemo(
    () => filteredLectures.slice(0, page * PAGE_SIZE),
    [filteredLectures, page]
  );

  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures]
  );

  const processedMajors = useMemo(
    () =>
      allMajors.map((major) => ({
        value: major,
        label: major.replace(/<p>/gi, " "),
      })),
    [allMajors]
  );

  const changeSearchOption = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      setPage(1);
      setSearchOptions((prev) => ({ ...prev, [field]: value }));
      loaderWrapperRef.current?.scrollTo(0, 0);
    },
    []
  );

  const handleMajorChange = useCallback(
    (majorValue: string, isChecked: boolean) => {
      const newMajors = isChecked
        ? [...searchOptions.majors, majorValue]
        : searchOptions.majors.filter((m) => m !== majorValue);

      changeSearchOption("majors", newMajors);
    },
    [searchOptions.majors, changeSearchOption]
  );

  const handleTimeChange = useCallback(
    (timeId: number, isChecked: boolean) => {
      const newTimes = isChecked
        ? [...searchOptions.times, timeId]
        : searchOptions.times.filter((t) => t !== timeId);

      changeSearchOption("times", newTimes);
    },
    [searchOptions.times, changeSearchOption]
  );

  const handleGradeChange = useCallback(
    (grade: number, isChecked: boolean) => {
      const newGrades = isChecked
        ? [...searchOptions.grades, grade]
        : searchOptions.grades.filter((g) => g !== grade);

      changeSearchOption("grades", newGrades);
    },
    [searchOptions.grades, changeSearchOption]
  );

  const handleDayChange = useCallback(
    (day: string, isChecked: boolean) => {
      const newDays = isChecked
        ? [...searchOptions.days, day]
        : searchOptions.days.filter((d) => d !== day);

      changeSearchOption("days", newDays);
    },
    [searchOptions.days, changeSearchOption]
  );

  const addSchedule = useCallback(
    (lecture: LectureWithParsedSchedule) => {
      if (!searchInfo) return;

      const { tableId } = searchInfo;

      const schedules = lecture.parsedSchedule.map((schedule) => ({
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
                  value={searchOptions.query}
                  onChange={(e) => changeSearchOption("query", e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>학점</FormLabel>
                <Select
                  value={searchOptions.credits}
                  onChange={(e) =>
                    changeSearchOption("credits", e.target.value)
                  }
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
                <HStack spacing={4}>
                  {[1, 2, 3, 4].map((grade) => (
                    <GradeCheckboxItem
                      grade={grade}
                      isChecked={searchOptions.grades.includes(grade)}
                      onChange={handleGradeChange}
                      key={grade}
                    />
                  ))}
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>요일</FormLabel>
                <HStack spacing={4}>
                  {DAY_LABELS.map((day) => (
                    <DayCheckboxItem
                      key={day}
                      day={day}
                      isChecked={searchOptions.days.includes(day)}
                      onChange={handleDayChange}
                    />
                  ))}
                </HStack>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>시간</FormLabel>
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
                        <TagCloseButton
                          onClick={() =>
                            changeSearchOption(
                              "times",
                              searchOptions.times.filter((v) => v !== time)
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
                  {TIME_SLOTS.map(({ id, label }) => (
                    <TimeCheckboxItem
                      key={id}
                      id={id}
                      label={label}
                      isChecked={searchOptions.times.includes(id)}
                      onChange={handleTimeChange}
                    />
                  ))}
                </Stack>
              </FormControl>

              <FormControl>
                <FormLabel>전공</FormLabel>
                <Wrap spacing={1} mb={2}>
                  {searchOptions.majors.map((major) => (
                    <Tag
                      key={major}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                    >
                      <TagLabel>{major.split("<p>").pop()}</TagLabel>
                      <TagCloseButton
                        onClick={() =>
                          changeSearchOption(
                            "majors",
                            searchOptions.majors.filter((v) => v !== major)
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
                  {processedMajors.map(({ value, label }) => (
                    <MajorCheckboxItem
                      key={value}
                      label={label}
                      value={value}
                      isChecked={searchOptions.majors.includes(value)}
                      onChange={(value, checked) =>
                        handleMajorChange(value, checked)
                      }
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
                    {visibleLectures.map((lecture) => (
                      <LectureRow
                        key={lecture.id}
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
};

export default SearchDialog;
