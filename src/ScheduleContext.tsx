import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import dummyScheduleMap from "./dummyScheduleMap.ts";
import { Schedule } from "./types.ts";

interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;
  getSchedules: (tableId: string) => Schedule[];
  updateSchedule: (
    tableId: string,
    index: number,
    updatedSchedule: Schedule
  ) => void;
  updateSchedulesByTableId: (
    tableId: string,
    updatedSchedules: Schedule[]
  ) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};

export const useTableSchedules = (tableId: string) => {
  const { getSchedules } = useScheduleContext();
  return useMemo(() => getSchedules(tableId), [getSchedules, tableId]);
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] =
    useState<Record<string, Schedule[]>>(dummyScheduleMap);

  const getSchedules = useCallback(
    (tableId: string) => {
      return schedulesMap[tableId] || [];
    },
    [schedulesMap]
  );

  const updateSchedule = useCallback(
    (tableId: string, index: number, updatedSchedule: Schedule) => {
      setSchedulesMap((prev) => {
        const tableSchedules = [...prev[tableId]];
        tableSchedules[index] = updatedSchedule;
        return {
          ...prev,
          [tableId]: tableSchedules,
        };
      });
    },
    []
  );

  const updateSchedulesByTableId = useCallback(
    (tableId: string, updatedSchedules: Schedule[]) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: updatedSchedules,
      }));
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      schedulesMap,
      getSchedules,
      updateSchedule,
      updateSchedulesByTableId,
    }),
    [schedulesMap, getSchedules, updateSchedule, updateSchedulesByTableId]
  );

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
};
