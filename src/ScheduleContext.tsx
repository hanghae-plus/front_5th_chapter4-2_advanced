import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  PropsWithChildren,
  useContext,
} from 'react';
import { Schedule } from './types';
import dummyScheduleMap from './dummyScheduleMap';

export type SchedulesMap = Record<string, Schedule[]>;

interface ScheduleActionsContextType {
  updateScheduleList: (key: string, newSchedules: Schedule[]) => void;
  addScheduleToList: (key: string, schedule: Schedule) => void;
  removeScheduleTable: (tableId: string) => void;
  updateSingleScheduleInList: (
    key: string,
    scheduleId: string,
    updatedProps: Partial<Schedule>
  ) => void;
  moveSchedule: (
    sourceKey: string,
    scheduleIdToMove: string,
    destinationKey: string,
    destinationIndex: number
  ) => void;
  setSchedulesMap: React.Dispatch<React.SetStateAction<SchedulesMap>>;
}

const SchedulesDataContext = createContext<SchedulesMap | undefined>(undefined);
const ScheduleActionsContext = createContext<ScheduleActionsContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] = useState<SchedulesMap>(dummyScheduleMap);

  const updateScheduleList = useCallback((key: string, newSchedules: Schedule[]) => {
    setSchedulesMap((prev) => ({
      ...prev,
      [key]: newSchedules,
    }));
  }, []);

  const addScheduleToList = useCallback((key: string, schedule: Schedule) => {
    setSchedulesMap((prev) => {
      const currentList = prev[key] ?? [];
      return {
        ...prev,
        [key]: [...currentList, schedule],
      };
    });
  }, []);

  const removeScheduleTable = useCallback((tableId: string) => {
    setSchedulesMap((prev) => {
      const newMap = { ...prev };
      delete newMap[tableId];
      return newMap;
    });
  }, []);

  const updateSingleScheduleInList = useCallback(
    (key: string, scheduleId: string, updatedProps: Partial<Schedule>) => {
      setSchedulesMap((prev) => {
        const list = prev[key] ?? [];
        const newList = list.map((item) =>
          item.id === scheduleId ? { ...item, ...updatedProps } : item
        );
        const isUnchanged = list.length === newList.length && list.every((item, idx) => item === newList[idx]);
        if (isUnchanged) return prev;

        return {
          ...prev,
          [key]: newList,
        };
      });
    },
    []
  );

  const moveSchedule = useCallback(
    (
      sourceKey: string,
      scheduleIdToMove: string,
      destinationKey: string,
      destinationIndex: number
    ) => {
      setSchedulesMap((prev) => {
        const newMap = { ...prev };

        const sourceList = newMap[sourceKey] ?? [];
        let movedItem: Schedule | undefined;
        const updatedSourceList = sourceList.filter((item) => {
          if (item.id === scheduleIdToMove) {
            movedItem = item;
            return false;
          }
          return true;
        });
        if (!movedItem) return prev;
        newMap[sourceKey] = updatedSourceList;

        const destList = newMap[destinationKey] ?? [];
        const updatedDestList = [...destList];
        updatedDestList.splice(destinationIndex, 0, movedItem);
        newMap[destinationKey] = updatedDestList;

        return newMap;
      });
    },
    []
  );

  const actionsContextValue = useMemo(
    () => ({
      updateScheduleList,
      addScheduleToList,
      removeScheduleTable,
      updateSingleScheduleInList,
      moveSchedule,
      setSchedulesMap,
    }),
    [
      updateScheduleList,
      addScheduleToList,
      removeScheduleTable,
      updateSingleScheduleInList,
      moveSchedule,
    ]
  );

  return (
    <SchedulesDataContext.Provider value={schedulesMap}>
      <ScheduleActionsContext.Provider value={actionsContextValue}>
        {children}
      </ScheduleActionsContext.Provider>
    </SchedulesDataContext.Provider>
  );
};

export const useSchedulesData = (): SchedulesMap => {
  const context = useContext(SchedulesDataContext);
  if (!context) {
    throw new Error('useSchedulesData must be used within a ScheduleProvider');
  }
  return context;
};

export const useScheduleActions = (): ScheduleActionsContextType => {
  const context = useContext(ScheduleActionsContext);
  if (!context) {
    throw new Error('useScheduleActions must be used within a ScheduleProvider');
  }
  return context;
};
