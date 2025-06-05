import { useEffect } from "react";

export const useInfiniteScroll = (
  loaderRef: React.RefObject<HTMLDivElement>,
  loaderWrapperRef: React.RefObject<HTMLDivElement>,
  lastPage: number,
  onLoadMore: () => void
) => {
  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0, root: $loaderWrapper }
    );

    observer.observe($loader);

    return () => observer.unobserve($loader);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastPage, onLoadMore]);
};
