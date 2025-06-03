import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent, 
} from "@dnd-kit/core";
import { PropsWithChildren } from "react";
import { CellSize, DAY_LABELS } from "./constants";
import { useSchedulesData, useScheduleActions } from "./ScheduleContext"; 
import { Schedule } from "./types"; 

function createSnapModifier(): Modifier {
  return ({ transform, containerNodeRect, draggingNodeRect }) => {
    const containerTop = containerNodeRect?.top ?? 0;
    const containerLeft = containerNodeRect?.left ?? 0;
    const containerBottom = containerNodeRect?.bottom ?? 0;
    const containerRight = containerNodeRect?.right ?? 0;

    const { top = 0, left = 0, bottom = 0, right = 0 } = draggingNodeRect ?? {};

    const minX = containerLeft - left + 120 + 1;
    const minY = containerTop - top + 40 + 1;
    const maxX = containerRight - right;
    const maxY = containerBottom - bottom;


    return ({
      ...transform,
      x: Math.min(Math.max(Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH, minX), maxX),
      y: Math.min(Math.max(Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT, minY), maxY),
    })
  };
}

const modifiers = [createSnapModifier()];

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const schedulesMap = useSchedulesData();
  const { updateScheduleList } = useScheduleActions();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (!active || (delta.x === 0 && delta.y === 0)) return;
    
    const activeId = String(active.id);
    const [tableId, scheduleIndexStr] = activeId.split(':');
    const scheduleIndex = Number(scheduleIndexStr);

    if (!tableId || isNaN(scheduleIndex)) {
      console.error("Invalid active.id format:", active.id);
      return;
    }

    const currentTableList = schedulesMap[tableId];
    if (!currentTableList || scheduleIndex < 0 || scheduleIndex >= currentTableList.length) {
      console.error(
        "Schedule not found for dragging. Active ID:", active.id,
        "Parsed TableID:", tableId, "Parsed Index:", scheduleIndex
      );
      return;
    }
    
    const scheduleToUpdate: Schedule = currentTableList[scheduleIndex];

    const { x, y } = delta;
    const nowDayIndex = DAY_LABELS.indexOf(scheduleToUpdate.day as typeof DAY_LABELS[number]);

    if (nowDayIndex === -1) {
        console.error("Current day of the schedule is not in DAY_LABELS:", scheduleToUpdate.day);
        return;
    }

    let newDayIndex = nowDayIndex + Math.floor(x / CellSize.WIDTH);
    newDayIndex = Math.max(0, Math.min(newDayIndex, DAY_LABELS.length - 1));
    const newDay = DAY_LABELS[newDayIndex];

    const moveTimeIndex = Math.floor(y / CellSize.HEIGHT);
    const newRange = scheduleToUpdate.range.map(time => {
      const newTime = time + moveTimeIndex;
      return Math.max(1, Math.min(newTime, 24));
    });
    const newTableList = currentTableList.map((targetSchedule, targetIndex) => {
      if (targetIndex === scheduleIndex) {
        return {
          ...targetSchedule,
          day: newDay,
          range: newRange,
        };
      }
      return targetSchedule;
    });
    updateScheduleList(tableId, newTableList);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
      {children}
    </DndContext>
  );
}