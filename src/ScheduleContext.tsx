import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { Schedule } from "./types.ts";
import dummyScheduleMap from "./dummyScheduleMap.ts";
import { DAY_LABELS } from "./constants.ts";

const ScheduleStateContext = createContext<
  Record<string, Schedule[]> | undefined
>(undefined);

const ScheduleDispatchContext = createContext<
  | {
      updateSchedule: (
        tableId: string,
        index: number,
        updates: Partial<Schedule>,
      ) => void;
      moveSchedule: (
        tableId: string,
        index: number,
        dayDelta: number,
        timeDelta: number,
      ) => void;
      deleteSchedule: (tableId: string, day: string, time: number) => void;
      duplicateTable: (targetId: string) => void;
      removeTable: (targetId: string) => void;
    }
  | undefined
>(undefined);

export const useScheduleState = () => {
  const context = useContext(ScheduleStateContext);
  if (context === undefined) {
    throw new Error("useScheduleState must be used within a ScheduleProvider");
  }
  return context;
};

export const useScheduleDispatch = () => {
  const context = useContext(ScheduleDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useScheduleDispatch must be used within a ScheduleProvider",
    );
  }
  return context;
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] =
    useState<Record<string, Schedule[]>>(dummyScheduleMap);

  const actions = useMemo(
    () => ({
      updateSchedule: (
        tableId: string,
        index: number,
        updates: Partial<Schedule>,
      ) => {
        setSchedulesMap((prev) => ({
          ...prev,
          [tableId]: prev[tableId].map((schedule, idx) =>
            idx === index ? { ...schedule, ...updates } : schedule,
          ),
        }));
      },

      moveSchedule: (
        tableId: string,
        index: number,
        dayDelta: number,
        timeDelta: number,
      ) => {
        if (dayDelta === 0 && timeDelta === 0) return;

        setSchedulesMap((prev) => {
          const schedules = prev[tableId];
          if (!schedules || !schedules[index]) return prev;

          const schedule = schedules[index];
          const nowDayIndex = DAY_LABELS.indexOf(
            schedule.day as (typeof DAY_LABELS)[number],
          );
          const newDayIndex = nowDayIndex + dayDelta;

          if (newDayIndex < 0 || newDayIndex >= DAY_LABELS.length) return prev;

          const newRange = schedule.range.map((time) => time + timeDelta);
          if (newRange.some((time) => time < 1 || time > 24)) return prev;

          const newSchedules = [...schedules];
          newSchedules[index] = {
            ...schedule,
            day: DAY_LABELS[newDayIndex],
            range: newRange,
          };

          return {
            ...prev,
            [tableId]: newSchedules,
          };
        });
      },

      deleteSchedule: (tableId: string, day: string, time: number) => {
        setSchedulesMap((prev) => ({
          ...prev,
          [tableId]: prev[tableId].filter(
            (schedule) =>
              schedule.day !== day || !schedule.range.includes(time),
          ),
        }));
      },

      duplicateTable: (targetId: string) => {
        setSchedulesMap((prev) => ({
          ...prev,
          [`schedule-${Date.now()}`]: [...prev[targetId]],
        }));
      },

      removeTable: (targetId: string) => {
        setSchedulesMap((prev) => {
          const newState = { ...prev };
          delete newState[targetId];
          return newState;
        });
      },
    }),
    [],
  );

  const contextValue = useMemo(() => schedulesMap, [schedulesMap]);
  const dispatchValue = useMemo(() => actions, [actions]);

  return (
    <ScheduleStateContext.Provider value={contextValue}>
      <ScheduleDispatchContext.Provider value={dispatchValue}>
        {children}
      </ScheduleDispatchContext.Provider>
    </ScheduleStateContext.Provider>
  );
};
