import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { Schedule } from "./types.ts";
import dummyScheduleMap from "./dummyScheduleMap.ts";

interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;
  setSchedulesMap: React.Dispatch<React.SetStateAction<Record<string, Schedule[]>>>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>(dummyScheduleMap);

  return (
    <ScheduleContext.Provider value={{ schedulesMap, setSchedulesMap }}>
      {children}
    </ScheduleContext.Provider>
  );
};

interface TableContextType {
  schedules: Schedule[];
  addSchedule: (schedule: Schedule) => void;
  removeSchedule: (day: string, time: number) => void;
  updateSchedules: (schedules: Schedule[]) => void;
}

const TableContext = createContext<TableContextType | null>(null);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
};

interface TableProviderProps extends PropsWithChildren {
  initialSchedules?: Schedule[];
}

export const TableProvider = ({ children, initialSchedules = [] }: TableProviderProps) => {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);

  const addSchedule = useCallback((schedule: Schedule) => {
    setSchedules(prev => [...prev, schedule]);
  }, []);

  const removeSchedule = useCallback((day: string, time: number) => {
    setSchedules(prev => 
      prev.filter(schedule => !(schedule.day === day && schedule.range[0] === time))
    );
  }, []);

  const updateSchedules = useCallback((newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
  }, []);

  const value = useMemo(() => ({
    schedules,
    addSchedule,
    removeSchedule,
    updateSchedules
  }), [schedules, addSchedule, removeSchedule, updateSchedules]);

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};

// 테이블 관리를 위한 상위 컨텍스트
interface TablesContextType {
  tableIds: string[];
  addTable: (tableId: string) => void;
  removeTable: (tableId: string) => void;
}

const TablesContext = createContext<TablesContextType | null>(null);

export const useTablesContext = () => {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error("useTablesContext must be used within a TablesProvider");
  }
  return context;
};

export const TablesProvider = ({ children }: PropsWithChildren) => {
  const [tableIds, setTableIds] = useState<string[]>(["table1", "table2"]);

  const addTable = useCallback((tableId: string) => {
    setTableIds(prev => [...prev, tableId]);
  }, []);

  const removeTable = useCallback((tableId: string) => {
    setTableIds(prev => prev.filter(id => id !== tableId));
  }, []);

  const value = useMemo(() => ({
    tableIds,
    addTable,
    removeTable
  }), [tableIds, addTable, removeTable]);

  return (
    <TablesContext.Provider value={value}>
      {children}
    </TablesContext.Provider>
  );
};
