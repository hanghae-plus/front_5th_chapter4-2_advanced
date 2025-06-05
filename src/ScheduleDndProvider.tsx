import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { PropsWithChildren, useCallback } from "react";
import { CellSize, DAY_LABELS } from "./constants.ts";
import { useScheduleContext } from "./ScheduleContext.tsx";

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
      x: Math.min(
        Math.max(
          Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH,
          minX
        ),
        maxX
      ),
      y: Math.min(
        Math.max(
          Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT,
          minY
        ),
        maxY
      ),
    };
  };
}

const modifiers = [createSnapModifier()];

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { schedulesMap, moveSchedule } = useScheduleContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const { active, delta } = event;
      const { x, y } = delta;
      const [tableId, index] = active.id.split(":");

      const schedule = schedulesMap[tableId]?.[index];
      if (!schedule) return;

      const nowDayIndex = DAY_LABELS.indexOf(
        schedule.day as (typeof DAY_LABELS)[number]
      );
      const moveDayIndex = Math.floor(x / CellSize.WIDTH);
      const moveTimeIndex = Math.floor(y / CellSize.HEIGHT);

      const newDayIndex = nowDayIndex + moveDayIndex;
      const newDay = DAY_LABELS[newDayIndex];
      const newRange = schedule.range.map((time) => time + moveTimeIndex);

      if (newDayIndex < 0 || newDayIndex >= DAY_LABELS.length) return;
      if (newRange.some((time) => time < 0 || time >= 24)) return; // 시간 범위 체크

      moveSchedule(tableId, Number(index), newDay, newRange);
    },
    [schedulesMap, moveSchedule]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
    >
      {children}
    </DndContext>
  );
}
