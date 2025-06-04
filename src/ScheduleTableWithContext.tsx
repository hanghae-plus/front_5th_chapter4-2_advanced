import React, { useCallback, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  Modifier,
  DragEndEvent,
} from "@dnd-kit/core";
import ScheduleTable from "./ScheduleTable";
import { Schedule } from "./types";
import { CellSize } from "./constants";
import { useScheduleDispatch } from "./ScheduleContext";

interface Props {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
}

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
          minX,
        ),
        maxX,
      ),
      y: Math.min(
        Math.max(
          Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT,
          minY,
        ),
        maxY,
      ),
    };
  };
}

const ScheduleTableWithContext = React.memo(
  ({ tableId, schedules, onScheduleTimeClick }: Props) => {
    const { moveSchedule } = useScheduleDispatch();

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      }),
    );

    const modifiers = useMemo(() => [createSnapModifier()], []);

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, delta } = event;
        const { x, y } = delta;

        const [dragTableId, indexStr] = active.id.toString().split(":");
        const index = Number(indexStr);

        if (dragTableId !== tableId) return;

        const moveDayIndex = Math.floor(x / CellSize.WIDTH);
        const moveTimeIndex = Math.floor(y / CellSize.HEIGHT);

        if (moveDayIndex === 0 && moveTimeIndex === 0) return;

        moveSchedule(tableId, index, moveDayIndex, moveTimeIndex);
      },
      [moveSchedule, tableId],
    );

    return (
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={modifiers}
      >
        <ScheduleTable
          tableId={tableId}
          schedules={schedules}
          onScheduleTimeClick={onScheduleTimeClick}
        />
      </DndContext>
    );
  },
);

export default ScheduleTableWithContext;
