import { forwardRef, memo } from "react";
import { Box, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { Lecture } from "@/types/types.ts";
import LectureTableRow from "./LectureTableRow";

interface LectureTableProps {
  visibleLectures: Lecture[];
  onAddSchedule: (lecture: Lecture) => void;
  loaderRef: React.RefObject<HTMLDivElement>;
}

const LectureTable = forwardRef<HTMLDivElement, LectureTableProps>(
  ({ visibleLectures, onAddSchedule, loaderRef }, ref) => {
    return (
      <Box>
        {/* 고정 헤더 */}
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

        {/* 스크롤 가능한 바디 */}
        <Box overflowY="auto" maxH="500px" ref={ref}>
          <Table size="sm" variant="striped">
            <Tbody>
              {visibleLectures.map((lecture, index) => (
                <LectureTableRow
                  key={`${lecture.id}-${index}`}
                  lecture={lecture}
                  index={index}
                  onAddSchedule={onAddSchedule}
                />
              ))}
            </Tbody>
          </Table>
          {/* 무한 스크롤 트리거 */}
          <Box ref={loaderRef} h="20px" />
        </Box>
      </Box>
    );
  }
);

LectureTable.displayName = "LectureTable";

export default memo(LectureTable);
