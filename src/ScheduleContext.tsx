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
        setSchedulesMap((prev) => {
          const schedule = prev[tableId][index];
          const nowDayIndex = DAY_LABELS.indexOf(
            schedule.day as (typeof DAY_LABELS)[number],
          );

          return {
            ...prev,
            [tableId]: prev[tableId].map((targetSchedule, targetIndex) => {
              if (targetIndex !== index) {
                return targetSchedule; // 불필요한 복사 제거!
              }
              return {
                ...targetSchedule,
                day: DAY_LABELS[nowDayIndex + dayDelta],
                range: targetSchedule.range.map((time) => time + timeDelta),
              };
            }),
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

  return (
    <ScheduleStateContext.Provider value={schedulesMap}>
      <ScheduleDispatchContext.Provider value={actions}>
        {children}
      </ScheduleDispatchContext.Provider>
    </ScheduleStateContext.Provider>
  );
};
