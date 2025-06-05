import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { Schedule } from "./types.ts";
import dummyScheduleMap from "./dummyScheduleMap.ts";

interface SchedulesMapContextType {
  schedulesMap: Record<string, Schedule[]>;
}

interface SchedulesMapDispatchContextType {
  setSchedulesMap: React.Dispatch<
    React.SetStateAction<Record<string, Schedule[]>>
  >;
}

const SchedulesMapContext = createContext<SchedulesMapContextType | undefined>(
  undefined
);
const SchedulesMapDispatchContext = createContext<
  SchedulesMapDispatchContextType | undefined
>(undefined);

export const useSchedulesMap = () => {
  const context = useContext(SchedulesMapContext);
  if (context === undefined) {
    throw new Error("useSchedulesMap must be used within a ScheduleProvider");
  }
  return context;
};

export const useSchedulesMapDispatch = () => {
  const context = useContext(SchedulesMapDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useSchedulesMapDispatch must be used within a ScheduleProvider"
    );
  }
  return context;
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] =
    useState<Record<string, Schedule[]>>(dummyScheduleMap);

  return (
    <SchedulesMapContext.Provider value={{ schedulesMap }}>
      <SchedulesMapDispatchContext.Provider value={{ setSchedulesMap }}>
        {children}
      </SchedulesMapDispatchContext.Provider>
    </SchedulesMapContext.Provider>
  );
};
