import { Schedule } from "@/types/types.ts";
import { useDndContext } from "@dnd-kit/core";
import DraggableSchedule from "./DraggableSchedule";
import ScheduleTableContainer from "./ScheduleTableContainer";
import { useMemo } from "react";

interface Props {
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
}: Props) => {
  const dndContext = useDndContext();

  const colorMap = useMemo(() => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
    return lectures.reduce((acc, lectureId, index) => {
      acc[lectureId] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [schedules]);

  const activeTableId = useMemo(() => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  }, [dndContext.active?.id]);

  const isActive = activeTableId === tableId;

  const scheduleItems = useMemo(
    () =>
      schedules.map((schedule, index) => ({
        key: `${schedule.lecture.id}-${schedule.day}-${schedule.range[0]}`,
        id: `${tableId}:${index}`,
        data: schedule,
        bg: colorMap[schedule.lecture.id],
        onDeleteButtonClick: () =>
          onDeleteButtonClick?.({
            day: schedule.day,
            time: schedule.range[0],
          }),
      })),
    [schedules, tableId, colorMap, onDeleteButtonClick]
  );

  return (
    <ScheduleTableContainer
      tableId={tableId}
      isActive={isActive}
      onScheduleTimeClick={onScheduleTimeClick}
    >
      {scheduleItems.map((item) => (
        <DraggableSchedule
          key={item.key}
          id={item.id}
          data={item.data}
          bg={item.bg}
          onDeleteButtonClick={item.onDeleteButtonClick}
        />
      ))}
    </ScheduleTableContainer>
  );
};

export default ScheduleTable;
