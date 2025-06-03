import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
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
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
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
import {
  ScheduleMemoizedMajors,
  ScheduleGradeCheckbox,
  ScheduleDaysCheckbox,
  ScheduleTimeCheckbox,
  ScheduleMemoizedLecture,
} from "./components/modal/index.ts";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

export interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

const PAGE_SIZE = 20;

const createdCacheFetch = () => {
  const cache = new Map();

  return (url: string): Promise<AxiosResponse<Lecture[]>> => {
    if (cache.has(url)) {
      return cache.get(url) as Promise<AxiosResponse<Lecture[]>>;
    }

    const request = axios.get<Lecture[]>(url);
    cache.set(url, request);

    request
      .then((response) => {
        cache.set(url, Promise.resolve(response));
      })
      .catch(() => {
        cache.delete(url);
      });

    return request;
  };
};

const fetchLectures = createdCacheFetch();

const fetchMajors = () => fetchLectures("/schedules-majors.json");
const fetchLiberalArts = () => fetchLectures("/schedules-liberal-arts.json");

const fetchAllLectures = () => Promise.all([fetchMajors(), fetchLiberalArts()]);

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
    days: searchInfo?.day ? [searchInfo.day] : [],
    times: searchInfo?.time ? [searchInfo.time] : [],
    majors: [],
  });

  const getFilteredLectures = () => {
    const { query = "", credits, grades, days, times, majors } = searchOptions;
    return lectures.filter((lecture) => {
      const matchesQuery =
        lecture.title.toLowerCase().includes(query.toLowerCase()) ||
        lecture.id.toLowerCase().includes(query.toLowerCase());

      const matchesGrade =
        grades.length === 0 || grades.includes(lecture.grade);

      const matchesMajor =
        majors.length === 0 || majors.includes(lecture.major);

      const matchesCredits =
        credits === undefined ||
        String(lecture.credits).startsWith(String(credits));

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
  };

  const filteredLectures = useMemo(
    () => getFilteredLectures(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lectures, searchOptions]
  );

  const lastPage = Math.ceil(filteredLectures.length / PAGE_SIZE);
  const visibleLectures = filteredLectures.slice(0, page * PAGE_SIZE);
  const allMajors = useMemo(() => {
    return [...new Set(lectures.map((lecture) => lecture.major))];
  }, [lectures]);

  const changeSearchOption = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      setPage(1);
      setSearchOptions({ ...searchOptions, [field]: value });
      loaderWrapperRef.current?.scrollTo(0, 0);
    },
    [searchOptions]
  );

  const addSchedule = (lecture: Lecture) => {
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
  };

  useEffect(() => {
    const start = performance.now();
    /** 캐시 구현 */
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
              <ScheduleGradeCheckbox
                searchOptions={searchOptions}
                changeSearchOption={changeSearchOption}
              />

              <ScheduleDaysCheckbox
                searchOptions={searchOptions}
                changeSearchOption={changeSearchOption}
              />
            </HStack>

            <HStack spacing={4}>
              <ScheduleTimeCheckbox
                times={searchOptions.times}
                changeSearchOption={changeSearchOption}
              />

              <FormControl>
                <FormLabel>전공</FormLabel>
                <CheckboxGroup
                  colorScheme="green"
                  value={searchOptions.majors}
                  onChange={(values) =>
                    changeSearchOption("majors", values as string[])
                  }
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
                  <ScheduleMemoizedMajors majors={allMajors} />
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
                <ScheduleMemoizedLecture
                  visibleLectures={visibleLectures}
                  addSchedule={addSchedule}
                  lastPage={lastPage}
                  setPage={setPage}
                />
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
