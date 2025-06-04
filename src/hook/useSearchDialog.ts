import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useScheduleContext } from "../ScheduleContext";
import { Lecture, SearchInfo, SearchOption } from "../types";
import { parseSchedule } from "../utils";
import { PAGE_SIZE } from "../constants/constants";
import { fetchAllLectures } from "../api/api";

export const useSearchDialog = (searchInfo: SearchInfo | null) => {
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

  // 1. filteredLectures를 useState로 따로 관리
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>([]);

  // 2. 검색 옵션이 바뀔 때만 필터링 수행
  useEffect(() => {
    const { query = "", credits, grades, days, times, majors } = searchOptions;
    const lowerQuery = query.toLowerCase();

    const result = lectures.filter((lecture) => {
      if (
        lowerQuery &&
        !lecture.title.toLowerCase().includes(lowerQuery) &&
        !lecture.id.toLowerCase().includes(lowerQuery)
      ) {
        return false;
      }

      if (grades.length > 0 && !grades.includes(lecture.grade)) {
        return false;
      }

      if (majors.length > 0 && !majors.includes(lecture.major)) {
        return false;
      }

      if (credits && !lecture.credits.startsWith(String(credits))) {
        return false;
      }

      if (days.length > 0 || times.length > 0) {
        const schedules = lecture.schedule
          ? parseSchedule(lecture.schedule)
          : [];

        if (days.length > 0 && !schedules.some((s) => days.includes(s.day))) {
          return false;
        }

        if (
          times.length > 0 &&
          !schedules.some((s) => s.range.some((time) => times.includes(time)))
        ) {
          return false;
        }
      }

      return true;
    });

    setFilteredLectures(result);
    setPage(1); // 검색 옵션이 바뀌면 첫 페이지로 이동
  }, [lectures, searchOptions]);

  // 3. page가 바뀔 때는 slice만 해서 보여줌
  const visibleLectures = useMemo(
    () => filteredLectures.slice(0, page * PAGE_SIZE),
    [filteredLectures, page]
  );

  const lastPage = useMemo(
    () => Math.ceil(filteredLectures.length / PAGE_SIZE),
    [filteredLectures.length]
  );

  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures]
  );

  const changeSearchOption = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      setSearchOptions((prev) => ({ ...prev, [field]: value }));
      loaderWrapperRef.current?.scrollTo(0, 0);
    },
    []
  );

  const addSchedule = useCallback(
    (lecture: Lecture, onClose: () => void) => {
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
    [searchInfo, setSchedulesMap]
  );

  // 최초 1회만 fetchAllLectures
  useEffect(() => {
    console.log(performance.now());
    fetchAllLectures().then((results) => {
      console.log(performance.now());
      setLectures(results.flatMap((result) => result.data));
    });
  }, []);

  // 인피니트 스크롤
  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) return;

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

  // searchInfo가 바뀌면 옵션 초기화
  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
  }, [searchInfo]);

  return {
    loaderWrapperRef,
    loaderRef,
    searchOptions,
    filteredLectures,
    visibleLectures,
    allMajors,
    changeSearchOption,
    addSchedule,
  };
};
