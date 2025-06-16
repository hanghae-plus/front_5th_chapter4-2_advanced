import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
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
  Table,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useScheduleContext } from "./ScheduleContext.tsx";
import { Lecture, SearchOption } from "./types.ts";
import { parseSchedule } from "./utils.ts";
import axios from "axios";
import { MajerSelector } from "./components/MajorSelector.tsx";
import { VisibleLecturesTable } from "./components/VisibleLecturesTable.tsx";
import { CreditsSelector } from "./components/CreditsSelector.tsx";
import { DaySelector } from "./components/DaySelector.tsx";
import { GradesSelector } from "./components/GradesSelector.tsx";
import { TimeSelector } from "./components/TimeSelector.tsx";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

const PAGE_SIZE = 100;

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

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

const fetchAllLectures = async () =>
  await Promise.all([
    (console.log("API Call 1", performance.now()),
    fetcherWithCache(fetchMajors, "majors")),
    (console.log("API Call 2", performance.now()),
    fetcherWithCache(fetchLiberalArts, "liberal-arts")),
    (console.log("API Call 3", performance.now()),
    fetcherWithCache(fetchMajors, "majors")),
    (console.log("API Call 4", performance.now()),
    fetcherWithCache(fetchLiberalArts, "liberal-arts")),
    (console.log("API Call 5", performance.now()),
    fetcherWithCache(fetchMajors, "majors")),
    (console.log("API Call 6", performance.now()),
    fetcherWithCache(fetchLiberalArts, "liberal-arts")),
  ]);

// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
const SearchDialog = memo(({ searchInfo, onClose }: Props) => {
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
              <CreditsSelector
                changeSearchOption={changeSearchOption}
                credits={searchOptions.credits}
              />
            </HStack>

            <HStack spacing={4}>
              <GradesSelector
                grades={searchOptions.grades}
                changeSearchOption={changeSearchOption}
              />
              <DaySelector
                days={searchOptions.days}
                changeSearchOption={changeSearchOption}
              />
            </HStack>

            <HStack spacing={4}>
              <TimeSelector
                times={searchOptions.times}
                changeSearchOption={changeSearchOption}
              />
              <MajerSelector
                allMajors={allMajors}
                majors={searchOptions.majors}
                changeSearchOption={changeSearchOption}
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

              <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
                <VisibleLecturesTable
                  visibleLectures={visibleLectures}
                  addSchedule={addSchedule}
                />
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
