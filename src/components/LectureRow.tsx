import { memo } from "react";
import { Button, Td, Tr } from "@chakra-ui/react";
import { Lecture } from "../types";
import { parseSchedule } from "../utils";

interface LectureRowProps {
    lecture: Lecture;
    tableId: string | undefined;
    onAddSchedule: (lecture: Lecture) => void;
}

const LectureRow = memo(({ lecture, onAddSchedule }: LectureRowProps) => {
    return (
        <Tr>
            <Td width="100px">{lecture.id}</Td>
            <Td width="50px">{lecture.grade}</Td>
            <Td width="200px">{lecture.title}</Td>
            <Td width="50px">{lecture.credits}</Td>
            <Td
                width="150px"
                dangerouslySetInnerHTML={{
                    __html: lecture.major,
                }}
            />
            <Td
                width="150px"
                dangerouslySetInnerHTML={{
                    __html: lecture.schedule,
                }}
            />
            <Td width="80px">
                <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => onAddSchedule(lecture)}
                >
                    추가
                </Button>
            </Td>
        </Tr>
    );
});

LectureRow.displayName = "LectureRow";

export default LectureRow;
