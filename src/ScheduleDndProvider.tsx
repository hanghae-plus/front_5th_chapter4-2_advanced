import { DndContext, DragEndEvent, Modifier, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { CellSize, DAY_LABELS } from "./constants.ts";
import { useScheduleContext } from "./ScheduleContext.tsx";

/**
 * 스냅 모디파이어 생성 함수
 * 드래그 시 그리드에 맞춰 스냅되도록 함
 */
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

/**
 * DnD 컨텍스트 제공자 컴포넌트
 * 드래그 앤 드롭 기능을 위한 컨텍스트를 제공
 */
export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { schedulesMap, setSchedule } = useScheduleContext();

  /**
   * 포인터 센서 설정
   * useMemo로 감싸서 불필요한 재생성 방지
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  /**
   * 스냅 모디파이어
   * useMemo로 감싸서 불필요한 재생성 방지
   */
  const modifiers = useMemo(() => [createSnapModifier()], []);

  /**
   * 드래그 종료 핸들러
   * useCallback으로 감싸서 schedulesMap이나 setSchedule이 변경될 때만 재생성
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    const { x, y } = delta;
    const [tableId, index] = String(active.id).split(':');
    const schedule = schedulesMap[tableId][Number(index)];
    const nowDayIndex = DAY_LABELS.indexOf(schedule.day as typeof DAY_LABELS[number]);
    const moveDayIndex = Math.floor(x / CellSize.WIDTH);
    const moveTimeIndex = Math.floor(y / CellSize.HEIGHT);

    setSchedule(tableId, schedule.lecture.id, {
      ...schedule,
      day: DAY_LABELS[nowDayIndex + moveDayIndex],
      range: schedule.range.map(time => time + moveTimeIndex),
    });
  }, [schedulesMap, setSchedule]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
      {children}
    </DndContext>
  );
}
