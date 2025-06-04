import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useScheduleStore } from "../../stores/scheduleStore";
import { Lecture } from "../../types";
import { parseSchedule } from "../../lib/utils";
import axios from "axios";
import { SearchForm, LectureTable } from "./index";

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

// API 캐싱을 위한 클로저 팩토리
const createApiCache = () => {
  const cache = new Map<string, Promise<import("axios").AxiosResponse<Lecture[]>>>();

  return {
    fetchMajors: (): Promise<import("axios").AxiosResponse<Lecture[]>> => {
      if (!cache.has("majors")) {
        cache.set("majors", axios.get<Lecture[]>("/schedules-majors.json"));
      }
      return cache.get("majors")!;
    },

    fetchLiberalArts: (): Promise<import("axios").AxiosResponse<Lecture[]>> => {
      if (!cache.has("liberalArts")) {
        cache.set("liberalArts", axios.get<Lecture[]>("/schedules-liberal-arts.json"));
      }
      return cache.get("liberalArts")!;
    },
  };
};

const apiCache = createApiCache();

// Promise.all을 정상적으로 병렬 실행하도록 수정
const fetchAllLectures = async () => {
  const results = await Promise.all([apiCache.fetchMajors(), apiCache.fetchLiberalArts()]);
  return results;
};

export const SearchDialog = ({ searchInfo, onClose }: Props) => {
  const { addMultipleSchedules } = useScheduleStore();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

      // 한 번에 모든 스케줄 추가 - 성능 최적화
      addMultipleSchedules(tableId, schedules);

      handleClose();
    },
    [searchInfo, addMultipleSchedules, handleClose]
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
    if (!searchInfo) return;

    // 데이터가 이미 있으면 초기 필터만 설정하고 API 호출하지 않음
    if (lectures.length > 0) {
      // 데이터가 이미 있을 때 초기 필터 설정
      setSearchOptions(prev => ({
        ...prev,
        days: searchInfo.day ? [searchInfo.day] : [],
        times: searchInfo.time ? [searchInfo.time] : [],
      }));
      setPage(1);
      return;
    }

    setIsLoading(true);
    fetchAllLectures()
      .then(results => {
        const allLectures = results.flatMap(result => result.data);
        setLectures(allLectures);

        // API 호출 완료 후 초기 필터 설정
        setSearchOptions(prev => ({
          ...prev,
          days: searchInfo.day ? [searchInfo.day] : [],
          times: searchInfo.time ? [searchInfo.time] : [],
        }));
        setPage(1);
      })
      .catch(() => {
        // 에러 처리
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [lectures.length, searchInfo]);

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

            {isLoading ? (
              <Text textAlign="center" py={8}>
                강의 목록을 불러오는 중...
              </Text>
            ) : (
              <LectureTable
                visibleLectures={visibleLectures}
                filteredLecturesCount={filteredLectures.length}
                onAddSchedule={addSchedule}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
