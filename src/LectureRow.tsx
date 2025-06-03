import React, { memo } from "react";
import { Button, Td, Tr } from "@chakra-ui/react";
import { Lecture } from "./types.ts";

/**
 * LectureRow 컴포넌트
 * - React.memo로 감싸서 lecture, onAdd(=addSchedule)가 바뀌지 않으면 재렌더링되지 않음
 */
interface LectureRowProps {
  lecture: Lecture;
  onAdd: (lec: Lecture) => void;
}

const LectureRow: React.FC<LectureRowProps> = memo(({ lecture, onAdd }) => {
  return (
    <Tr>
      <Td width="100px">{lecture.id}</Td>
      <Td width="50px">{lecture.grade}</Td>
      <Td width="200px">{lecture.title}</Td>
      <Td width="50px">{lecture.credits}</Td>
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
      <Td width="80px">
        <Button size="sm" colorScheme="green" onClick={() => onAdd(lecture)}>
          추가
        </Button>
      </Td>
    </Tr>
  );
});

export default LectureRow;