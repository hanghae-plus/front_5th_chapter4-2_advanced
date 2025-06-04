import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Schedule } from "../types";
import dummyScheduleMap from "../data/dummyScheduleMap";

interface ScheduleState {
  schedulesMap: Record<string, Schedule[]>;

  // Actions
  updateSchedule: (tableId: string, scheduleIndex: number, updates: Partial<Schedule>) => void;
  addSchedule: (tableId: string, schedule: Schedule) => void;
  addMultipleSchedules: (tableId: string, schedules: Schedule[]) => void;
  removeSchedule: (tableId: string, day: string, time: number) => void;
  duplicateTable: (targetId: string) => void;
  removeTable: (targetId: string) => void;
  setSchedulesMap: (schedulesMap: Record<string, Schedule[]>) => void;

  // Selectors (for granular subscriptions)
  getSchedulesByTableId: (tableId: string) => Schedule[];
}

export const useScheduleStore = create<ScheduleState>()(
  subscribeWithSelector((set, get) => ({
    schedulesMap: dummyScheduleMap,

    updateSchedule: (tableId, scheduleIndex, updates) => {
      const state = get();
      const currentSchedules = state.schedulesMap[tableId];

      // 실제로 변경이 있는지 확인
      const currentSchedule = currentSchedules[scheduleIndex];
      const hasChanges = Object.keys(updates).some(
        key => currentSchedule[key as keyof Schedule] !== updates[key as keyof Schedule]
      );

      if (!hasChanges) return; // 변경사항이 없으면 업데이트하지 않음

      const updatedSchedules = currentSchedules.map((schedule, index) =>
        index === scheduleIndex ? { ...schedule, ...updates } : schedule
      );

      // 해당 테이블의 스케줄만 업데이트 (변경 감지 최적화)
      set(state => ({
        schedulesMap: {
          ...state.schedulesMap,
          [tableId]: updatedSchedules,
        },
      }));
    },

    addSchedule: (tableId, schedule) => {
      set(state => ({
        schedulesMap: {
          ...state.schedulesMap,
          [tableId]: [...state.schedulesMap[tableId], schedule],
        },
      }));
    },

    addMultipleSchedules: (tableId, schedules) => {
      set(state => ({
        schedulesMap: {
          ...state.schedulesMap,
          [tableId]: [...state.schedulesMap[tableId], ...schedules],
        },
      }));
    },

    removeSchedule: (tableId, day, time) => {
      set(state => ({
        schedulesMap: {
          ...state.schedulesMap,
          [tableId]: state.schedulesMap[tableId].filter(
            schedule => schedule.day !== day || !schedule.range.includes(time)
          ),
        },
      }));
    },

    duplicateTable: targetId => {
      const state = get();
      const newTableId = `schedule-${Date.now()}`;
      set({
        schedulesMap: {
          ...state.schedulesMap,
          [newTableId]: [...state.schedulesMap[targetId]],
        },
      });
    },

    removeTable: targetId => {
      set(state => {
        const newSchedulesMap = { ...state.schedulesMap };
        delete newSchedulesMap[targetId];
        return { schedulesMap: newSchedulesMap };
      });
    },

    setSchedulesMap: schedulesMap => {
      set({ schedulesMap });
    },

    getSchedulesByTableId: tableId => {
      return get().schedulesMap[tableId] || [];
    },
  }))
);

// 특정 테이블의 스케줄만 구독하는 커스텀 훅 (성능 최적화)
export const useTableSchedules = (tableId: string) => {
  return useScheduleStore(state => state.schedulesMap[tableId] || []);
};
