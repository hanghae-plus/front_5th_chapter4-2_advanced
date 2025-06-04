import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useScheduleContext } from "./ScheduleContext";
import { DAY_LABELS } from "./constants";
import { useCallback } from "react";
import { createSnapModifier } from "./createSnapModifier";

export const useDndContextValue = () => {
  const modifiers = [createSnapModifier()];

  const { setSchedulesMap } = useScheduleContext();
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

      setSchedulesMap((prev) => {
        const schedule = prev[tableId][index];
        const nowDayIndex = DAY_LABELS.indexOf(
          schedule.day as (typeof DAY_LABELS)[number]
        );
        const moveDayIndex = Math.floor(x / 80);
        const moveTimeIndex = Math.floor(y / 30);

        const updatedSchedules = [...prev[tableId]];
        updatedSchedules[index] = {
          ...schedule,
          day: DAY_LABELS[nowDayIndex + moveDayIndex],
          range: schedule.range.map((time) => time + moveTimeIndex),
        };
        return {
          ...prev,
          [tableId]: updatedSchedules,
        };
      });
    },
    [setSchedulesMap]
  );

  return { sensors, handleDragEnd, modifiers };
};
