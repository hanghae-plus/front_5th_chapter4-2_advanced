import { Schedule } from "./types.ts";
import { useDndContext } from "@dnd-kit/core";
import { useCallback, useMemo } from "react";
import { TableContainer } from "./components/TableContainer.tsx";
import { TableGrid } from "./components/TableGrid.tsx";
import { DraggableSchedule } from "./components/DraggableSchedule.tsx";

interface ScheduleTableProps {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

const ScheduleTable = ({
  tableId,
  schedules,
  onScheduleTimeClick,
  onDeleteButtonClick,
}: ScheduleTableProps) => {
  const dndContext = useDndContext();

  const getColor = useCallback(
    (lectureId: string): string => {
      const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
      const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
      return colors[lectures.indexOf(lectureId) % colors.length];
    },
    [schedules]
  );

  const activeTableId = useMemo(() => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  }, [dndContext.active?.id]);

  const handleTimeClick = useCallback(
    (day: string, time: number) => {
      onScheduleTimeClick?.({ day, time });
    },
    [onScheduleTimeClick]
  );

  const scheduleComponents = useMemo(() => {
    return schedules.map((schedule, index) => (
      <DraggableSchedule
        key={`${schedule.lecture.id}-${index}`}
        id={`${tableId}:${index}`}
        data={schedule}
        bg={getColor(schedule.lecture.id)}
        onDeleteButtonClick={() =>
          onDeleteButtonClick?.({
            day: schedule.day,
            time: schedule.range[0],
          })
        }
      />
    ));
  }, [schedules, tableId, getColor, onDeleteButtonClick]);

  return (
    <TableContainer isActive={activeTableId === tableId}>
      <TableGrid onTimeClick={handleTimeClick} />
      {scheduleComponents}
    </TableContainer>
  );
};

export default ScheduleTable;
