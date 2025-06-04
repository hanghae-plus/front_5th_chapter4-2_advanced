import { Box, Button, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { LegacyRef, memo } from "react";
import type { Lecture } from "@/types";

interface LectureTableProps {
  loaderWrapperRef: LegacyRef<HTMLDivElement> | undefined;
  loaderRef: LegacyRef<HTMLDivElement> | undefined;
  visibleLectures: Lecture[];
  addSchedule: (lecture: Lecture) => void;
}

interface LectureTableRow {
  lecture: Lecture;
  index: number;
  addSchedule: (lecture: Lecture) => void;
}

const LectureTableRow = memo(
  ({ lecture, index, addSchedule }: LectureTableRow) => {
    return (
      <Tr key={`${lecture.id}-${index}`}>
        <Td width="100px">{lecture.id}</Td>
        <Td width="50px">{lecture.grade}</Td>
        <Td width="200px">{lecture.title}</Td>
        <Td width="50px">{lecture.credits}</Td>
        <Td
          width="150px"
          dangerouslySetInnerHTML={{ __html: lecture.major }}
        />
        <Td
          width="150px"
          dangerouslySetInnerHTML={{ __html: lecture.schedule }}
        />
        <Td width="80px">
          <Button
            size="sm"
            colorScheme="green"
            onClick={() => addSchedule(lecture)}>
            추가
          </Button>
        </Td>
      </Tr>
    );
  },
);

const LectureTable = ({
  loaderWrapperRef,
  loaderRef,
  visibleLectures,
  addSchedule,
}: LectureTableProps) => {
  return (
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
      <Box
        overflowY="auto"
        maxH="500px"
        ref={loaderWrapperRef}>
        <Table
          size="sm"
          variant="striped">
          <Tbody>
            {visibleLectures.map((lecture, index) => (
              <LectureTableRow
                lecture={lecture}
                index={index}
                addSchedule={addSchedule}
              />
            ))}
          </Tbody>
        </Table>
        <Box
          ref={loaderRef}
          h="20px"
        />
      </Box>
    </Box>
  );
};

export default memo(LectureTable);
