/* eslint-disable @typescript-eslint/no-explicit-any */
import { PAGE_SIZE } from "@/constants/constants";
import { useCallback, useEffect, useMemo, useState } from "react";

export const usePagination = (
  totalItems: number,
  pageSize: number = PAGE_SIZE,
  resetTrigger?: any
) => {
  const [page, setPage] = useState(1);

  const lastPage = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [totalItems, pageSize]
  );

  const visibleItems = useMemo(() => page * pageSize, [page, pageSize]);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  // resetTrigger가 변경될 때 페이지 초기화
  useEffect(() => {
    if (resetTrigger !== undefined) {
      resetPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  return {
    page,
    setPage,
    lastPage,
    visibleItems,
    resetPage,
  };
};
