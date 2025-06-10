import { PAGE_SIZE } from "@/constants/constants";
import { useFilteredLectures } from "./useFilteredLectures";
import { useLectureData } from "./useLectureData";
import { usePagination } from "./usePagination";
import { useSearchOptions } from "./useSearchOptions";
import { useScheduleManagement } from "./useScheduleManagement";
import { useScrollManagement } from "./useScrollManagement";
import { useCallback, useMemo, useRef } from "react";
import { SearchOption } from "@/components/dialog/types";
import { useInfiniteScroll } from "./useInfiniteScroll";

interface SearchInfo {
  tableId: string;
  day?: string;
  time?: number;
}

export const useSearchDialog = (
  searchInfo?: SearchInfo | null,
  onClose?: () => void
) => {
  // 개별 hooks 사용
  const { lectures, allMajors } = useLectureData();
  const { searchOptions, changeSearchOption } = useSearchOptions(searchInfo);
  const filteredLectures = useFilteredLectures(lectures, searchOptions);
  const { setPage, lastPage, visibleItems, resetPage } = usePagination(
    filteredLectures.length,
    PAGE_SIZE,
    searchOptions // searchOptions가 변경되면 페이지 리셋
  );
  const { addSchedule } = useScheduleManagement(searchInfo, onClose);
  const { loaderWrapperRef, scrollToTop } = useScrollManagement();

  const loaderRef = useRef<HTMLDivElement>(null);

  // 검색 옵션 변경 시 페이지 리셋 및 스크롤 최상단 이동
  const handleSearchOptionChange = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      changeSearchOption(field, value);
      resetPage();
      scrollToTop();
    },
    [changeSearchOption, resetPage, scrollToTop]
  );

  // 무한 스크롤 설정
  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => Math.min(lastPage, prevPage + 1));
  }, [lastPage, setPage]);

  useInfiniteScroll(loaderRef, loaderWrapperRef, lastPage, handleLoadMore);

  // 표시할 강의 목록
  const visibleLectures = useMemo(
    () => filteredLectures.slice(0, visibleItems),
    [filteredLectures, visibleItems]
  );

  return {
    // 데이터
    lectures,
    allMajors,
    filteredLectures,
    visibleLectures,

    // 상태
    searchOptions,

    // 핸들러
    handleSearchOptionChange,
    addSchedule,

    // refs
    loaderRef,
    loaderWrapperRef,
  };
};
