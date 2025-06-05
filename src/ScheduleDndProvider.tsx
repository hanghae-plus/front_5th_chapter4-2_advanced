import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { PropsWithChildren, useCallback } from "react";
import { CellSize } from "./constants.ts";
import { useScheduleDispatch } from "./ScheduleContext.tsx";

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

const SNAP_MODIFIER = createSnapModifier();
const MODIFIERS = [SNAP_MODIFIER];

const SENSOR_CONFIG = {
  activationConstraint: {
    distance: 8,
  },
};

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { moveSchedule } = useScheduleDispatch();

  const sensors = useSensors(useSensor(PointerSensor, SENSOR_CONFIG));

  const handleDragEnd = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const { active, delta } = event;
      const { x, y } = delta;

      const [tableId, indexStr] = active.id.split(":");
      const index = Number(indexStr);

      const moveDayIndex = Math.floor(x / CellSize.WIDTH);
      const moveTimeIndex = Math.floor(y / CellSize.HEIGHT);

      if (moveDayIndex === 0 && moveTimeIndex === 0) return;

      moveSchedule(tableId, index, moveDayIndex, moveTimeIndex);
    },
    [moveSchedule],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={MODIFIERS}
    >
      {children}
    </DndContext>
  );
}
