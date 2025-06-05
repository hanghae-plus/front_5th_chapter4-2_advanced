import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Schedule } from "./types.ts";
import dummyScheduleMap from "./dummyScheduleMap.ts";

interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;

  // 세분화된 업데이트 함수들
  updateSchedule: (
    tableId: string,
    scheduleIndex: number,
    newSchedule: Schedule
  ) => void;
  addSchedules: (tableId: string, schedules: Schedule[]) => void;
  removeSchedule: (tableId: string, day: string, time: number) => void;

  // 테이블 관리 함수들
  duplicateTable: (sourceTableId: string) => void;
  removeTable: (tableId: string) => void;

  // 기존 코드와의 호환성을 위해 임시로 유지
  setSchedulesMap: React.Dispatch<
    React.SetStateAction<Record<string, Schedule[]>>
  >;
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

// 🔥 핵심 개선: 특정 테이블만 구독 (schedulesMap을 직접 참조)
export const useSchedules = (tableId: string) => {
  const { schedulesMap } = useScheduleContext();
  // 🎯 오직 해당 tableId의 배열 참조가 변경될 때만 리렌더링
  return useMemo(() => schedulesMap[tableId] || [], [schedulesMap[tableId]]);
};

// 테이블 키 목록만 구독 (실제 키 변경시에만 업데이트)
export const useTableIds = () => {
  const { schedulesMap } = useScheduleContext();
  const tableKeys = Object.keys(schedulesMap);

  // 🎯 테이블 개수나 키가 실제로 변경될 때만 리렌더링
  return useMemo(() => tableKeys, [tableKeys.length, tableKeys.join(",")]);
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] =
    useState<Record<string, Schedule[]>>(dummyScheduleMap);

  // 특정 스케줄만 업데이트 (드래그&드롭용)
  const updateSchedule = useCallback(
    (tableId: string, scheduleIndex: number, newSchedule: Schedule) => {
      setSchedulesMap((prev) => {
        const currentSchedules = prev[tableId];
        if (!currentSchedules || scheduleIndex >= currentSchedules.length) {
          return prev; // 유효하지 않은 경우 변경 없음
        }

        // 🎯 해당 테이블의 배열만 새로 생성 (다른 테이블은 참조 유지)
        const updatedSchedules = currentSchedules.map((schedule, index) =>
          index === scheduleIndex ? newSchedule : schedule
        );

        return {
          ...prev,
          [tableId]: updatedSchedules, // 🔥 이 테이블만 새로운 참조
        };
      });
    },
    []
  );

  // 스케줄 추가 (SearchDialog용)
  const addSchedules = useCallback((tableId: string, schedules: Schedule[]) => {
    if (schedules.length === 0) return;

    setSchedulesMap((prev) => ({
      ...prev,
      [tableId]: [...(prev[tableId] || []), ...schedules], // 🔥 이 테이블만 새로운 참조
    }));
  }, []);

  // 스케줄 제거
  const removeSchedule = useCallback(
    (tableId: string, day: string, time: number) => {
      setSchedulesMap((prev) => {
        const currentSchedules = prev[tableId] || [];
        const newSchedules = currentSchedules.filter(
          (schedule) => schedule.day !== day || !schedule.range.includes(time)
        );

        // 변경이 없으면 이전 상태 유지
        if (currentSchedules.length === newSchedules.length) {
          return prev;
        }

        return {
          ...prev,
          [tableId]: newSchedules, // 🔥 이 테이블만 새로운 참조
        };
      });
    },
    []
  );

  // 테이블 복제
  const duplicateTable = useCallback((sourceTableId: string) => {
    setSchedulesMap((prev) => {
      if (!prev[sourceTableId]) return prev;

      return {
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[sourceTableId]], // 새 테이블 추가
      };
    });
  }, []);

  // 테이블 제거
  const removeTable = useCallback((tableId: string) => {
    setSchedulesMap((prev) => {
      if (!prev[tableId]) return prev;

      const newMap = { ...prev };
      delete newMap[tableId];
      return newMap;
    });
  }, []);

  const value = useMemo(
    () => ({
      // 🔥 핵심: schedulesMap 직접 노출
      schedulesMap,

      // 업데이트 함수들
      updateSchedule,
      addSchedules,
      removeSchedule,
      duplicateTable,
      removeTable,

      // 기존 API (호환성)
      setSchedulesMap,
    }),
    [
      schedulesMap,
      updateSchedule,
      addSchedules,
      removeSchedule,
      duplicateTable,
      removeTable,
      setSchedulesMap,
    ]
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
