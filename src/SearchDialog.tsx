import { useEffect, useState, useMemo, useCallback } from "react";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, VStack } from "@chakra-ui/react";
import { useScheduleContext } from "./ScheduleContext.tsx";
import { Lecture } from "./types.ts";
import { parseSchedule } from "./utils.ts";
import axios from "axios";
import { SearchForm, LectureTable } from "./components";

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

const PAGE_SIZE = 100;

/**
 * API 호출 결과를 캐시
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

  const results = await Promise.all([apiCache.fetchMajors(), apiCache.fetchLiberalArts()]);

  const end = performance.now();
  console.log("모든 API 호출 완료: ", end);
  console.log("API 호출에 걸린 시간(ms): ", end - start);

  return results;
};

const SearchDialog = ({ searchInfo, onClose }: Props) => {
  const { setSchedulesMap } = useScheduleContext();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);
  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: "",
    grades: [],
    days: [],
    times: [],
    majors: [],
  });

  // 고유한 ID prefix 생성
  const idPrefix = useMemo(() => `search-${searchInfo?.tableId || "default"}`, [searchInfo?.tableId]);

  // 모달 닫힐 때 상태 초기화
  const handleClose = useCallback(() => {
    setSearchOptions({
      query: "",
      grades: [],
      days: [],
      times: [],
      majors: [],
    });
    setPage(1);
    onClose();
  }, [onClose]);

  // 필터링된 강의 목록 - 메모이제이션으로 최적화
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
        if (days.length === 0) return true;
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some(s => days.includes(s.day));
      })
      .filter(lecture => {
        if (times.length === 0) return true;
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some(s => s.range.some(time => times.includes(time)));
      });
  }, [lectures, searchOptions]);

  // 페이지네이션 관련 계산
  const lastPage = useMemo(() => Math.ceil(filteredLectures.length / PAGE_SIZE), [filteredLectures]);
  const visibleLectures = useMemo(() => filteredLectures.slice(0, page * PAGE_SIZE), [filteredLectures, page]);
  const allMajors = useMemo(() => [...new Set(lectures.map(lecture => lecture.major))], [lectures]);
  const hasMore = useMemo(() => page < lastPage, [page, lastPage]);

  // 페이지 로드 핸들러
  const handleLoadMore = useCallback(() => {
    setPage(prevPage => Math.min(lastPage, prevPage + 1));
  }, [lastPage]);

  // 검색 옵션 변경 핸들러 - 메모이제이션으로 불필요한 리렌더링 방지
  const handleSearchOptionChange = useCallback((field: keyof SearchOption, value: SearchOption[typeof field]) => {
    setPage(1);
    setSearchOptions(prev => ({ ...prev, [field]: value }));
  }, []);

  // 강의 추가 핸들러
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

      handleClose();
    },
    [searchInfo, setSchedulesMap, handleClose]
  );

  // 전공 체크박스 토글 핸들러
  const handleMajorToggle = useCallback(
    (major: string, checked: boolean) => {
      const newMajors = checked ? [...searchOptions.majors, major] : searchOptions.majors.filter(m => m !== major);
      handleSearchOptionChange("majors", newMajors);
    },
    [searchOptions.majors, handleSearchOptionChange]
  );

  // 시간 슬롯 체크박스 토글 핸들러
  const handleTimeSlotToggle = useCallback(
    (id: number, checked: boolean) => {
      const newTimes = checked ? [...searchOptions.times, id] : searchOptions.times.filter(t => t !== id);
      handleSearchOptionChange("times", newTimes);
    },
    [searchOptions.times, handleSearchOptionChange]
  );

  // API 호출 최적화 - 모달이 열릴 때만, 그리고 데이터가 없을 때만 호출
  useEffect(() => {
    if (!searchInfo || lectures.length > 0) return;

    fetchAllLectures().then(results => {
      setLectures(results.flatMap(result => result.data));
    });
  }, [searchInfo, lectures.length]);

  // searchInfo 변경 시 초기 필터 설정
  useEffect(() => {
    if (searchInfo) {
      setSearchOptions(prev => ({
        ...prev,
        days: searchInfo.day ? [searchInfo.day] : prev.days,
        times: searchInfo.time ? [searchInfo.time] : prev.times,
      }));
      setPage(1);
    }
  }, [searchInfo]);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={handleClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <SearchForm
              searchOptions={searchOptions}
              allMajors={allMajors}
              idPrefix={idPrefix}
              onSearchOptionChange={handleSearchOptionChange}
              onMajorToggle={handleMajorToggle}
              onTimeSlotToggle={handleTimeSlotToggle}
            />

            <LectureTable
              visibleLectures={visibleLectures}
              filteredLecturesCount={filteredLectures.length}
              onAddSchedule={addSchedule}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;
