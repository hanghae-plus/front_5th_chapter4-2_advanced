import React from "react";
import { Lecture } from "./types";
import { Box, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { LectureRow } from "./LectureRow";

export const LectureTable = React.memo(
  ({
    lectures,
    onAddSchedule,
  }: {
    lectures: Lecture[];
    onAddSchedule: (lecture: Lecture) => void;
  }) => {
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

        <Box overflowY="auto" maxH="500px">
          <Table size="sm" variant="striped">
            <Tbody>
              {lectures.map((lecture, index) => (
                <LectureRow
                  key={`${lecture.id}-${index}`}
                  lecture={lecture}
                  index={index}
                  onAddSchedule={onAddSchedule}
                />
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    );
  }
);
