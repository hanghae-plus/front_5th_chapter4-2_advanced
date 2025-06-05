import { PAGE_SIZE } from "@/constants";
import { useScheduleContext } from "@/hooks/use-schedule-context";
import { cacheGet } from "@/lib/axios.ts";
import { Lecture, SearchOption } from "@/types.ts";
import { parseSchedule } from "@/utils.ts";
import {
  Box,
  HStack,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CreditsSelect } from "./credits-select";
import { DaysCheckbox } from "./days-checkbox";
import { GradeCheckbox } from "./grade-checkbox";
import { MajorsCheckbox } from "./majors-checkbox";
import { SearchInput } from "./search-input";
import { TimeCheckbox } from "./time-checkbox";
import { VisibleLectureTable } from "./visible-lecture-table";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

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

  // 과도한 filter 연산 부하, getFilteredLectures 대신 useMemo 사용
  const filteredLectures = useMemo(() => {
    const { query = "", credits, grades, days, times, majors } = searchOptions;
    return lectures
      .filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(query.toLowerCase()) ||
          lecture.id.toLowerCase().includes(query.toLowerCase())
      )
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

  // setter 에서 prev 참조로 변경, useCallback 사용
  const changeSearchOption = useCallback((field: keyof SearchOption, value: SearchOption[typeof field]) => {
    setPage(1);
    setSearchOptions((p) => ({ ...p, [field]: value }));
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  // useCallback 사용, context나 props로 받은 함수 의존성 추가
  const addSchedule = useCallback(
    (lecture: Lecture) => {
      if (!searchInfo) return;

      const { tableId } = searchInfo;

      const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
        ...schedule,
        lecture,
      }));

      setSchedulesMap((p) => ({ ...p, [tableId]: [...p[tableId], ...schedules] }));

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
              <SearchInput searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
              <CreditsSelect searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
            </HStack>

            <HStack spacing={4}>
              <GradeCheckbox searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
              <DaysCheckbox searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
            </HStack>

            <HStack spacing={4}>
              <TimeCheckbox searchOptions={searchOptions} changeSearchOption={changeSearchOption} />
              <MajorsCheckbox
                searchOptions={searchOptions}
                changeSearchOption={changeSearchOption}
                allMajors={allMajors}
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
                <VisibleLectureTable visibleLectures={visibleLectures} addSchedule={addSchedule} />
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
