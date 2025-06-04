import { memo, useRef, useEffect } from "react";
import { Box, Table, Tbody, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { Lecture } from "../../types.ts";
import { LectureRow } from "./index";

interface LectureTableProps {
  visibleLectures: Lecture[];
  filteredLecturesCount: number;
  onAddSchedule: (lecture: Lecture) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

// 강의 테이블 컴포넌트 - 검색 옵션 변경시에도 테이블만 리렌더링
const LectureTable = memo(
  ({ visibleLectures, filteredLecturesCount, onAddSchedule, onLoadMore, hasMore }: LectureTableProps) => {
    const loaderWrapperRef = useRef<HTMLDivElement>(null);
    const loaderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const $loader = loaderRef.current;
      const $loaderWrapper = loaderWrapperRef.current;

      if (!$loader || !$loaderWrapper || !hasMore) {
        return;
      }

      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        { threshold: 0, root: $loaderWrapper }
      );

      observer.observe($loader);

      return () => observer.unobserve($loader);
    }, [hasMore, onLoadMore]);

    return (
      <>
        <Text align="right">검색결과: {filteredLecturesCount}개</Text>
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
            <Table size="sm" variant="striped">
              <Tbody>
                {visibleLectures.map((lecture, index) => (
                  <LectureRow
                    key={`${lecture.id}-${index}`}
                    lecture={lecture}
                    index={index}
                    onAddSchedule={onAddSchedule}
                  />
                ))}
              </Tbody>
            </Table>
            {hasMore && <Box ref={loaderRef} h="20px" />}
          </Box>
        </Box>
      </>
    );
  }
);

LectureTable.displayName = "LectureTable";

export default LectureTable;
