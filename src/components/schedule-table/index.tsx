import { useLocalScheduleContext } from "@/hooks/use-local-schedule-context";
import { Box } from "@chakra-ui/react";
import { useDndContext } from "@dnd-kit/core";
import { memo, useMemo } from "react";
import { DraggableSchedule } from "./draggable-schedule";
import { ScheduleTableGrid } from "./schedule-table-grid";

// ScheduleTable 에 memo 사용, Props중 다른 table과 영향이 있는 isActive를 제외하고 나머진 Context API에서 useMemo로 하달해서 사용됨
const ScheduleTable = memo(() => {
  const { tableId, schedules, handleDeleteButtonClick } = useLocalScheduleContext();

  const dndContext = useDndContext();

  const activeTableId = useMemo(() => {
    const activeId = dndContext.active?.id;
    return activeId ? String(activeId).split(":")[0] : null;
  }, [dndContext.active?.id]);

  const colorMap = useMemo(() => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
    return lectures.reduce((acc, id, idx) => {
      acc[id] = colors[idx % colors.length];
      return acc;
    }, {} as Record<string, string>);
  }, [schedules]);

  const onDeleteButtonClick = useMemo(
    () => schedules.map((s) => () => handleDeleteButtonClick({ day: s.day, time: s.range[0] })),
    [schedules, handleDeleteButtonClick]
  );

  const schedulesItems = useMemo(() => {
    return schedules.map((schedule, index) => (
      <DraggableSchedule
        key={`${schedule.lecture.title}-${index}`}
        id={`${tableId}:${index}`}
        data={schedule}
        bg={colorMap[schedule.lecture.id]}
        onDeleteButtonClick={onDeleteButtonClick[index]}
      />
    ));
  }, [schedules, tableId, colorMap, onDeleteButtonClick]);

  return (
    <Box position="relative" outline={activeTableId === tableId ? "5px dashed" : undefined} outlineColor="blue.300">
      <ScheduleTableGrid />
      {schedulesItems}
    </Box>
  );
});

export default ScheduleTable;
