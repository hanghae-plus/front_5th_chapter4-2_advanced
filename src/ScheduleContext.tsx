/* eslint-disable react-refresh/only-export-components */
import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import dummyScheduleMap from "./dummyScheduleMap.ts";
import { Schedule } from "./types.ts";

interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;
  setSchedulesMap: React.Dispatch<React.SetStateAction<Record<string, Schedule[]>>>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>(dummyScheduleMap);

  return <ScheduleContext.Provider value={{ schedulesMap, setSchedulesMap }}>{children}</ScheduleContext.Provider>;
};

// 테이블별 local schedules Context 함수
type LocalScheduleContextType = {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
};

const LocalScheduleContext = createContext<LocalScheduleContextType>({ tableId: "", schedules: [] });

export const LocalScheduleProvider = ({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick, children }: PropsWithChildren<LocalScheduleContextType>) => {
  const contextValue = useMemo(
    () => ({
      tableId,
      schedules,
      onScheduleTimeClick,
      onDeleteButtonClick,
    }),
    [tableId, schedules, onScheduleTimeClick, onDeleteButtonClick]
  );
  return <LocalScheduleContext.Provider value={contextValue}>{children}</LocalScheduleContext.Provider>;
};

export const useLocalScheduleContext = () => {
  const context = useContext(LocalScheduleContext);
  if (context === undefined) {
    throw new Error("useLocalSchedule must be used within a LocalScheduleProvider");
  }
  return context;
};
