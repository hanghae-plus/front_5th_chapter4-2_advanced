import { useEffect, useRef } from "react";
import { Box, Table, Tbody } from "@chakra-ui/react";
import { Lecture } from "./types";
import { MemoizedRow } from "./MemoizedRow";

interface Props {
  visibleLectures: Lecture[];
  addSchedule: (lecture: Lecture) => void;
  loaderWrapperRef: React.RefObject<HTMLDivElement>;
  loaderRef: React.RefObject<HTMLDivElement>;
}

export const LectureTable = ({
  visibleLectures,
  addSchedule,
  loaderRef,
  loaderWrapperRef,
}: Props) => {
  const renderedRowsRef = useRef<JSX.Element[]>([]);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (visibleLectures.length > prevLengthRef.current) {
      const newLectures = visibleLectures.slice(prevLengthRef.current);
      const newRows = newLectures.map((lecture, index) => (
        <MemoizedRow
          key={`${lecture.id}-${prevLengthRef.current + index}`}
          lecture={lecture}
          onAdd={addSchedule}
        />
      ));

      renderedRowsRef.current.push(...newRows);
      prevLengthRef.current = visibleLectures.length;
    }
  }, [visibleLectures, addSchedule]);

  return (
    <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
      <Table size="sm" variant="striped">
        <Tbody>{renderedRowsRef.current}</Tbody>
      </Table>
      <Box ref={loaderRef} h="20px" />
    </Box>
  );
};
