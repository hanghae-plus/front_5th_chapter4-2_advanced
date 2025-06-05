import { ScheduleMap } from "../../types.ts";

export interface ScheduleMapStore {
  getScheduleMap: () => ScheduleMap;
  setScheduleMap: (
    action: ScheduleMap | ((prev: ScheduleMap) => ScheduleMap)
  ) => void;
  subscribe: (callback: () => void) => () => void;
}

export const createScheduleMapStore = (
  initialScheduleMap: ScheduleMap
): ScheduleMapStore => {
  let scheduleMap = initialScheduleMap;

  const listeners = new Set<() => void>();

  const getScheduleMap: ScheduleMapStore["getScheduleMap"] = () => scheduleMap;

  const setScheduleMap: ScheduleMapStore["setScheduleMap"] = (nextState) => {
    if (typeof nextState === "function") {
      scheduleMap = nextState(scheduleMap);
    } else {
      scheduleMap = nextState;
    }

    listeners.forEach((listener) => listener());
  };

  const subscribe: ScheduleMapStore["subscribe"] = (callback) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
  };

  return { getScheduleMap, setScheduleMap, subscribe };
};
