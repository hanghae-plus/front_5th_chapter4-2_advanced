import { Lecture } from "@/types.ts";
import { Table, Tbody } from "@chakra-ui/react";
import { memo } from "react";
import { LectureTr } from "./lecture-tr";

export const VisibleLectureTable = memo(
  ({ visibleLectures, addSchedule }: { visibleLectures: Lecture[]; addSchedule: (lecture: Lecture) => void }) => {
    return (
      <Table size="sm" variant="striped">
        <Tbody>
          {visibleLectures.map((lecture, index) => (
            <LectureTr key={`${lecture.id}-${index}`} lecture={lecture} addSchedule={addSchedule} />
          ))}
        </Tbody>
      </Table>
    );
  }
);
