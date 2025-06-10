import { useCallback, useRef } from "react";

export const useScrollManagement = () => {
  const loaderWrapperRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    loaderWrapperRef.current?.scrollTo(0, 0);
  }, []);

  return {
    loaderWrapperRef,
    scrollToTop,
  };
};
