import { Box } from "@chakra-ui/react";
import { Schedule } from "./types.ts";
import { memo, useState } from "react";
import MemoizedDraggableSchedule from "./components/DraggableSchedule.tsx";
import { ScheduleGrid } from "./components/ScheduleGrid.tsx";

interface Props {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

const COLORS = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];

const ScheduleTable = ({
  tableId,
  schedules,
  onScheduleTimeClick,
  onDeleteButtonClick,
}: Props) => {
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const getColor = (lectureId: string): string => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    return COLORS[lectures.indexOf(lectureId) % COLORS.length];
  };

  return (
    <Box
      position="relative"
      outline={activeTableId === tableId ? "5px dashed" : undefined}
      outlineColor="blue.300"
    >
      <ScheduleGrid onScheduleTimeClick={onScheduleTimeClick} />
      {schedules.map((schedule, index) => (
        <MemoizedDraggableSchedule
          key={`${schedule.lecture.title}-${index}`}
          id={`${tableId}:${index}`}
          data={schedule}
          bg={getColor(schedule.lecture.id)}
          setActiveTableId={setActiveTableId}
          onDeleteButtonClick={() =>
            onDeleteButtonClick?.({
              day: schedule.day,
              time: schedule.range[0],
            })
          }
        />
      ))}
    </Box>
  );
};

const MemoizedScheduleTable = memo(ScheduleTable);
export default MemoizedScheduleTable;
