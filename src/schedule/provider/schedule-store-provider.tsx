import { createContext, ReactNode, useRef } from "react";
import dummyScheduleMap from "../../dummyScheduleMap.ts";
import {
  createScheduleMapStore,
  ScheduleMapStore,
} from "../store/schedule-store";
import { ScheduleMap } from "../../types.ts";

// eslint-disable-next-line react-refresh/only-export-components
export const ScheduleStoreContext = createContext(
  createScheduleMapStore(dummyScheduleMap)
);

interface ScheduleStoreProviderProps {
  initialScheduleMap: ScheduleMap;
  children: ReactNode;
}

export const ScheduleStoreProvider = ({
  initialScheduleMap,
  children,
}: ScheduleStoreProviderProps) => {
  const scheduleStoreRef = useRef<ScheduleMapStore>();

  if (!scheduleStoreRef.current) {
    scheduleStoreRef.current = createScheduleMapStore(initialScheduleMap);
  }

  return (
    <ScheduleStoreContext.Provider value={scheduleStoreRef.current}>
      {children}
    </ScheduleStoreContext.Provider>
  );
};
