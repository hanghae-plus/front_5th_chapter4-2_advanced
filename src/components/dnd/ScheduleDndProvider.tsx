import { DndContext, Modifier, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { PropsWithChildren, useCallback } from "react";
import { CellSize, DAY_LABELS } from "../../data/constants";
import { useScheduleStore } from "../../stores/scheduleStore";

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

    return {
      ...transform,
      x: Math.min(Math.max(Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH, minX), maxX),
      y: Math.min(Math.max(Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT, minY), maxY),
    };
  };
}

const modifiers = [createSnapModifier()];

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { schedulesMap, updateSchedule } = useScheduleStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: { active: { id: string | number }; delta: { x: number; y: number } }) => {
      const { active, delta } = event;
      const { x, y } = delta;
      const [tableId, index] = String(active.id).split(":");
      const schedule = schedulesMap[tableId][Number(index)];
      const nowDayIndex = DAY_LABELS.indexOf(schedule.day as (typeof DAY_LABELS)[number]);
      const moveDayIndex = Math.floor(x / 80);
      const moveTimeIndex = Math.floor(y / 30);

      const newDay = DAY_LABELS[nowDayIndex + moveDayIndex];
      const newRange = schedule.range.map((time: number) => time + moveTimeIndex);

      updateSchedule(tableId, Number(index), {
        day: newDay,
        range: newRange,
      });
    },
    [schedulesMap, updateSchedule]
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
      {children}
    </DndContext>
  );
}
