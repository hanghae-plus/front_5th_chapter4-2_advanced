import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import CreditSelect from "./CreditSelect";
import DaySelect from "./DaySelect";
import GradeSelect from "./GradeSelect";
import LectureTable from "./LectureTable";
import MajorSelect from "./MajorSelect";
import SearchInput from "./SearchInput";
import TimeSelect from "./TimeSelect";
import { useScheduleContext } from "@/ScheduleContext.tsx";
import fetchApi from "@/lib/fetchApi.ts";
import { Lecture } from "@/types.ts";
import { parseSchedule } from "@/utils.ts";
import { SearchOption } from "@/types.ts";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

const PAGE_SIZE = 100;

const fetchMajors = fetchApi<Lecture[]>({
  method: "get",
  url: "/schedules-majors.json",
});
const fetchLiberalArts = fetchApi<Lecture[]>({
  method: "get",
  url: "/schedules-liberal-arts.json",
});

const fetchAllLectures = async () =>
  await Promise.all([
    (console.log("API Call 1", performance.now()), fetchMajors()),
    (console.log("API Call 2", performance.now()), fetchLiberalArts()),
    (console.log("API Call 3", performance.now()), fetchMajors()),
    (console.log("API Call 4", performance.now()), fetchLiberalArts()),
    (console.log("API Call 5", performance.now()), fetchMajors()),
    (console.log("API Call 6", performance.now()), fetchLiberalArts()),
  ]);

const getFilteredLectures = (
  searchOptions: SearchOption,
  lectures: Lecture[],
) => {
  const { query = "", credits, grades, days, times, majors } = searchOptions;
  return lectures
    .filter(
      (lecture) =>
        lecture.title.toLowerCase().includes(query.toLowerCase()) ||
        lecture.id.toLowerCase().includes(query.toLowerCase()),
    )
    .filter((lecture) => grades.length === 0 || grades.includes(lecture.grade))
    .filter((lecture) => majors.length === 0 || majors.includes(lecture.major))
    .filter(
      (lecture) => !credits || lecture.credits.startsWith(String(credits)),
    )
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
      return schedules.some((s) =>
        s.range.some((time) => times.includes(time)),
      );
    });
};

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

  const filteredLectures = useMemo(
    () => getFilteredLectures(searchOptions, lectures),
    [searchOptions, lectures],
  );
  const lastPage = useMemo(
    () => Math.ceil(filteredLectures.length / PAGE_SIZE),
    [filteredLectures],
  );
  const visibleLectures = useMemo(
    () => filteredLectures.slice(0, page * PAGE_SIZE),
    [page, filteredLectures],
  );
  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures],
  );

  const changeSearchOption = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      console.log(field, value);

      setPage(1);
      setSearchOptions((prevSearchOptions) => ({
        ...prevSearchOptions,
        [field]: value,
      }));
      loaderWrapperRef.current?.scrollTo(0, 0);
    },
    [],
  );

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
    [searchInfo, onClose, setSchedulesMap],
  );

  useEffect(() => {
    const start = performance.now();
    console.log("API 호출 시작: ", start);
    fetchAllLectures().then((results) => {
      const end = performance.now();
      console.log("모든 API 호출 완료 ", end);
      console.log("API 호출에 걸린 시간(ms): ", end - start);

      const validResults = results.filter(
        (result): result is NonNullable<typeof result> => result !== null,
      );
      setLectures(validResults.flatMap((result) => result.data));
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
      { threshold: 0, root: $loaderWrapper },
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
    <Modal
      isOpen={Boolean(searchInfo)}
      onClose={onClose}
      size="6xl">
      <ModalOverlay />
      <ModalContent
        maxW="90vw"
        w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack
            spacing={4}
            align="stretch">
            <HStack spacing={4}>
              <SearchInput
                query={searchOptions.query}
                changeSearchOption={changeSearchOption}
              />
              <CreditSelect
                credits={searchOptions.credits}
                changeSearchOption={changeSearchOption}
              />
            </HStack>

            <HStack spacing={4}>
              <GradeSelect
                grades={searchOptions.grades}
                changeSearchOption={changeSearchOption}
              />
              <DaySelect
                days={searchOptions.days}
                changeSearchOption={changeSearchOption}
              />
            </HStack>

            <HStack spacing={4}>
              <TimeSelect
                times={searchOptions.times}
                changeSearchOption={changeSearchOption}
              />

              <MajorSelect
                majors={searchOptions.majors}
                changeSearchOption={changeSearchOption}
                allMajors={allMajors}
              />
            </HStack>
            <Text align="right">검색결과: {filteredLectures.length}개</Text>
            <LectureTable
              loaderWrapperRef={loaderWrapperRef}
              loaderRef={loaderRef}
              visibleLectures={visibleLectures}
              addSchedule={addSchedule}
            />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;
