import { createContext, PropsWithChildren, useContext, useState, useCallback } from "react";
import { Schedule } from "./types.ts";
import dummyScheduleMap from "./dummyScheduleMap.ts";

/**
 * Context 타입 정의
 * 기존의 단일 setSchedulesMap 대신 세부적인 액션 메서드들을 제공하여
 * 불필요한 리렌더링을 방지하고 더 명확한 상태 관리가 가능하도록 함
 */
interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;
  setSchedulesMap: (updater: (prev: Record<string, Schedule[]>) => Record<string, Schedule[]>) => void;
  setSchedule: (tableId: string, scheduleId: string, newSchedule: Schedule) => void;
  addSchedule: (tableId: string, schedule: Schedule) => void;
  removeSchedule: (tableId: string, scheduleId: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useScheduleContext must be used within a ScheduleProvider");
  }
  return context;
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>(dummyScheduleMap);

  /**
   * 특정 스케줄만 업데이트하는 메서드
   * 기존: 전체 schedulesMap을 업데이트하여 불필요한 리렌더링 발생
   * 변경: 특정 테이블의 특정 스케줄만 업데이트하여 성능 개선
   */
  const setSchedule = useCallback((tableId: string, scheduleId: string, newSchedule: Schedule) => {
    setSchedulesMap(prev => ({
      ...prev,
      [tableId]: prev[tableId].map(schedule => 
        schedule.lecture.id === scheduleId ? newSchedule : schedule
      )
    }));
  }, []);

  /**
   * 새 스케줄 추가 메서드
   * 기존: setSchedulesMap으로 전체 상태를 업데이트
   * 변경: 특정 테이블에만 스케줄을 추가하여 성능 개선
   */
  const addSchedule = useCallback((tableId: string, schedule: Schedule) => {
    setSchedulesMap(prev => ({
      ...prev,
      [tableId]: [...prev[tableId], schedule]
    }));
  }, []);

  /**
   * 스케줄 삭제 메서드
   * 기존: setSchedulesMap으로 전체 상태를 업데이트
   * 변경: 특정 테이블에서 특정 스케줄만 삭제하여 성능 개선
   */
  const removeSchedule = useCallback((tableId: string, scheduleId: string) => {
    setSchedulesMap(prev => ({
      ...prev,
      [tableId]: prev[tableId].filter(schedule => schedule.lecture.id !== scheduleId)
    }));
  }, []);

  return (
    <ScheduleContext.Provider value={{ 
      schedulesMap, 
      setSchedulesMap,
      setSchedule, 
      addSchedule, 
      removeSchedule 
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};
