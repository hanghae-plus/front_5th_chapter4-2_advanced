// src/LectureRow.tsx
import React, { memo, useCallback } from "react";
import { Tr, Td, Button } from "@chakra-ui/react";
import { Lecture } from "./types.ts"; // Lecture 타입을 임포트해야 합니다.

interface LectureRowProps {
  lecture: Lecture;
  index: number;
  onAddSchedule: (lecture: Lecture) => void;
}

const LectureRow: React.FC<LectureRowProps> = memo(
  ({ lecture, onAddSchedule }) => {
    const handleAddClick = useCallback(() => {
      onAddSchedule(lecture);
    }, [onAddSchedule, lecture]);

    return (
      <Tr>
        <Td width="100px">{lecture.id}</Td>
        <Td width="50px">{lecture.grade}</Td>
        <Td width="200px">{lecture.title}</Td>
        <Td width="50px">{lecture.credits}</Td>
        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
        <Td
          width="150px"
          dangerouslySetInnerHTML={{ __html: lecture.schedule }}
        />
        <Td width="80px">
          <Button size="sm" colorScheme="green" onClick={handleAddClick}>
            추가
          </Button>
        </Td>
      </Tr>
    );
  }
);

export default LectureRow;
