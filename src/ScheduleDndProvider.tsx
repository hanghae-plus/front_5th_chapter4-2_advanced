import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragEndEvent,
} from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import { CellSize, DAY_LABELS } from './constants.ts';
import { useScheduleContext } from './ScheduleContext.tsx';
import { Schedule } from './types.ts';

function createSnapModifier(): Modifier {
  return ({ transform, containerNodeRect, draggingNodeRect }) => {
    if (!containerNodeRect || !draggingNodeRect) {
      return transform;
    }

    const minX = containerNodeRect.left - draggingNodeRect.left + 120 + 1;
    const minY = containerNodeRect.top - draggingNodeRect.top + 40 + 1;
    const maxX = containerNodeRect.right - draggingNodeRect.right;
    const maxY = containerNodeRect.bottom - draggingNodeRect.bottom;

    return {
      ...transform,
      x: Math.min(Math.max(Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH, minX), maxX),
      y: Math.min(
        Math.max(Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT, minY),
        maxY
      ),
    };
  };
}

const modifiers = [createSnapModifier()];

interface DndState {
  activeTableId: string | null;
}

type DndProviderChildren = React.ReactNode | ((props: DndState) => React.ReactNode);

interface ScheduleDndProviderProps {
  children: DndProviderChildren;
}

export default function ScheduleDndProvider({ children }: ScheduleDndProviderProps) {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 드래그 시작 시 실행 : 드래그 중인 아이템의 tableId 호출
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const [tableId] = String(event.active.id).split(':');
    setActiveTableId(tableId);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // 드래그 종료 시 실행 : 아이템 위치 업데이트
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      if (!active) return;

      // 드래그 중인 아이템의 tableId와 index 추출
      const [tableId, index] = String(active.id).split(':');
      const scheduleList = schedulesMap[tableId];
      if (!scheduleList) return;

      // 위치 계산 로직 (x, y -> dayIndex, timeIndex)
      const moveDayIndex = Math.floor(delta.x / CellSize.WIDTH);
      const moveTimeIndex = Math.floor(delta.y / CellSize.HEIGHT);

      // drop 시점에만 전역 state 업데이트
      setSchedulesMap((prev) => {
        const newArr = prev[tableId].map((item, i) => {
          if (i !== Number(index)) return item;
          const nowDayIndex = DAY_LABELS.indexOf(item.day as (typeof DAY_LABELS)[number]);
          return {
            ...item,
            day: DAY_LABELS[nowDayIndex + moveDayIndex], // dayIndex 업데이트
            range: item.range.map((time) => time + moveTimeIndex), // timeIndex 업데이트
          } as Schedule;
        });
        return {
          ...prev,
          [tableId]: newArr, // 해당 tableId의 스케줄 업데이트
        };
      });

      // 드래그 완료 후 activeTableId 해제
      setActiveTableId(null);
    },
    [schedulesMap, setSchedulesMap]
  );

  // children이 함수인지 확인하고, DndState를 인자로 호출하여 렌더링
  const renderChildren = () => {
    if (typeof children === 'function') {
      // children이 함수이면, DndState를 인자로 호출
      const fn = children as (props: DndState) => React.ReactNode;
      return fn({ activeTableId });
    } else {
      // 그렇지 않으면 일반 Node로 렌더
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
      <DragOverlay></DragOverlay>
    </DndContext>
  );
}
