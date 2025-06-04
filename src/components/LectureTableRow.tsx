import { Button, Td, Tr } from "@chakra-ui/react";
import { Lecture } from "../types";
import { memo, useCallback } from "react";

interface LectureTableRowProps {
  lecture: Lecture;
  addSchedule: (lecture: Lecture) => void;
}

const LectureTableRow = memo(
  ({ lecture, addSchedule }: LectureTableRowProps) => {
    const { id, grade, title, credits, major, schedule } = lecture;

    const handleAddSchedule = useCallback(() => {
      addSchedule(lecture);
    }, [addSchedule, lecture]);

    return (
      <Tr>
        <Td width="100px">{id}</Td>
        <Td width="50px">{grade}</Td>
        <Td width="200px">{title}</Td>
        <Td width="50px">{credits}</Td>
        <Td width="150px" dangerouslySetInnerHTML={{ __html: major }} />
        <Td width="150px" dangerouslySetInnerHTML={{ __html: schedule }} />
        <Td width="80px">
          <Button size="sm" colorScheme="green" onClick={handleAddSchedule}>
            추가
          </Button>
        </Td>
      </Tr>
    );
  }
);

LectureTableRow.displayName = "LectureTableRow";

export default LectureTableRow;
