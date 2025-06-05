/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, Text, Flex } from "@chakra-ui/react";
import { Lecture, LectureWithLowerCased } from "./types.ts";
import { LectureRow } from "./search-dialog.lecture-row.tsx";

interface LectureTableProps {
  filteredLectures: LectureWithLowerCased[];
  visibleLectures: LectureWithLowerCased[];
  onAddSchedule: (lecture: Lecture) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const LectureTable = ({
  filteredLectures,
  visibleLectures,
  onAddSchedule,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: LectureTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? visibleLectures.length + 1 : visibleLectures.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65, // 행 높이
    overscan: 5,
  });

  // 마지막 항목이 보일 때 다음 페이지 로드
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= visibleLectures.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    visibleLectures.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <Box>
      <Text align="right" mb={2}>
        검색결과: {filteredLectures.length}개 (표시중: {visibleLectures.length}
        개)
      </Text>

      <Flex
        fontWeight={700}
        style={{
          fontSize: "0.75rem",
        }}
        color={"#4A5568"}
        fontSize="sm"
        minH="40px"
        align="center"
        px={2}
      >
        <Box width="12.5%" px={2}>
          과목코드
        </Box>
        <Box width="6.6%" px={2} textAlign="center">
          학년
        </Box>
        <Box width="25%" px={2}>
          과목명
        </Box>
        <Box width="8.5%" px={2} textAlign="center">
          학점
        </Box>
        <Box width="18.7%" px={2}>
          전공
        </Box>
        <Box width="18.7%" px={2}>
          시간
        </Box>
        <Box width="10%" px={2}></Box>
      </Flex>

      {/* 가상화된 리스트 컨테이너 */}
      <Box ref={parentRef} height="500px" overflow="auto">
        <Box position="relative" height={`${rowVirtualizer.getTotalSize()}px`}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const isLoaderRow = virtualRow.index > visibleLectures.length - 1;
            const lecture = visibleLectures[virtualRow.index];

            if (isLoaderRow) return null;

            return (
              <Box
                key={virtualRow.index}
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height={`${virtualRow.size}px`}
                transform={`translateY(${virtualRow.start}px)`}
              >
                <LectureRow
                  lecture={lecture}
                  onAddSchedule={onAddSchedule}
                  isEven={virtualRow.index % 2 === 0}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
