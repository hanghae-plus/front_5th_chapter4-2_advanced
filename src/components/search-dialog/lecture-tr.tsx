import { Lecture } from "@/types.ts";
import { Button, Td, Tr } from "@chakra-ui/react";
import { memo, useCallback } from "react";

export const LectureTr = memo(
  ({ lecture, addSchedule }: { lecture: Lecture; addSchedule: (lecture: Lecture) => void }) => {
    const handleAddClick = useCallback(() => addSchedule(lecture), [addSchedule, lecture]);

    return (
      <Tr>
        <Td width="100px">{lecture.id}</Td>
        <Td width="50px">{lecture.grade}</Td>
        <Td width="200px">{lecture.title}</Td>
        <Td width="50px">{lecture.credits}</Td>
        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
        <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
        <Td width="80px">
          <Button size="sm" colorScheme="green" onClick={handleAddClick}>
            추가
          </Button>
        </Td>
      </Tr>
    );
  }
);
