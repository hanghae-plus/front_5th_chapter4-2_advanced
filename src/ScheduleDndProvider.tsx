import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragEndEvent,
} from "@dnd-kit/core";
import { useState, useCallback } from "react";
import { useScheduleState, useScheduleActions } from "./ScheduleContext.tsx";
import { CellSize, DAY_LABELS } from "./constants.ts";
import { Schedule } from "./types.ts";

// Snap-to-grid 기능을 위한 Modifier 생성
function createSnapModifier(): Modifier {
  return ({ transform, containerNodeRect, draggingNodeRect }) => {
    if (!containerNodeRect || !draggingNodeRect) return transform;

    const minX = containerNodeRect.left - draggingNodeRect.left + 121;
    const minY = containerNodeRect.top - draggingNodeRect.top + 41;
    const maxX = containerNodeRect.right - draggingNodeRect.right;
    const maxY = containerNodeRect.bottom - draggingNodeRect.bottom;

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

interface DndState {
  activeTableId: string | null;
}

type DndProviderChildren =
  | React.ReactNode
  | ((props: DndState) => React.ReactNode);

interface ScheduleDndProviderProps {
  children: DndProviderChildren;
}

export default function ScheduleDndProvider({
  children,
}: ScheduleDndProviderProps) {
  const schedulesMap = useScheduleState();
  const setSchedulesMap = useScheduleActions();
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const [tableId] = String(event.active.id).split(":");
    setActiveTableId(tableId);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      if (!active) return;

      const [tableId, index] = String(active.id).split(":");
      const scheduleList = schedulesMap[tableId];
      if (!scheduleList) return;

      const moveDayIndex = Math.floor(delta.x / CellSize.WIDTH);
      const moveTimeIndex = Math.floor(delta.y / CellSize.HEIGHT);

      setSchedulesMap((prev) => {
        const updated = prev[tableId].map((item, i) => {
          if (i !== Number(index)) return item;

          const nowDayIndex = DAY_LABELS.indexOf(
            item.day as (typeof DAY_LABELS)[number]
          );

          return {
            ...item,
            day: DAY_LABELS[nowDayIndex + moveDayIndex],
            range: item.range.map((time) => time + moveTimeIndex),
          } as Schedule;
        });

        return {
          ...prev,
          [tableId]: updated,
        };
      });

      setActiveTableId(null);
    },
    [schedulesMap, setSchedulesMap]
  );

  const renderChildren = () =>
    typeof children === "function"
      ? (children as (props: DndState) => React.ReactNode)({ activeTableId })
      : children;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
    >
      {renderChildren()}
      <DragOverlay />
    </DndContext>
  );
}
