import React, { useCallback, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from "@dnd-kit/core";
import { CellSize, DAY_LABELS } from "./constants.ts";
import { useScheduleContext } from "./ScheduleContext.tsx";
import { Schedule } from "./types";

// 드래그 위치를 격자(CellSize 단위)로 맞추고, 컨테이너 범위를 벗어나지 않도록 제한
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
      )
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
  children
}: ScheduleDndProviderProps) {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  // 마우스를 8px 이상 움직여야 드래그 시작됨
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  // 드래그 시작 시 tableId 추출
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const [tableId] = String(event.active.id).split(":");
    setActiveTableId(tableId);
  }, []);

  // 드래그 종료 시 schedulesMap 업데이트
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
        const newArr = prev[tableId].map((item, i) => {
          if (i !== Number(index)) return item;

          const nowDayIndex = DAY_LABELS.indexOf(item.day);
          return {
            ...item,
            day: DAY_LABELS[nowDayIndex + moveDayIndex],
            range: item.range.map((time) => time + moveTimeIndex)
          } as Schedule;
        });

        return {
          ...prev,
          [tableId]: newArr
        };
      });

      setActiveTableId(null);
    },
    [schedulesMap, setSchedulesMap]
  );

  // children이 함수형이면 activeTableId 전달
  const renderChildren = () => {
    if (typeof children === "function") {
      return (children as (props: DndState) => React.ReactNode)({
        activeTableId
      });
    } else {
      return children;
    }
  };

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
