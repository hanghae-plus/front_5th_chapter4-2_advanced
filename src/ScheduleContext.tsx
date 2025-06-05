import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { Schedule } from "./types";
import dummyScheduleMap from "./dummyScheduleMap";

type SchedulseType = Record<string, Schedule[]>;

const ScheduleStateContext = createContext<SchedulseType | undefined>(
  undefined
);

const ScheduleActionsContext = createContext<
  React.Dispatch<React.SetStateAction<SchedulseType>> | undefined
>(undefined);

export const useScheduleState = () => {
  const context = useContext(ScheduleStateContext);
  if (!context) {
    throw new Error(
      "[useScheduleState] ScheduleProvider 내에서만 사용해야 합니다."
    );
  }
  return context;
};

export const useScheduleActions = () => {
  const context = useContext(ScheduleActionsContext);
  if (!context) {
    throw new Error(
      "[useScheduleActions] ScheduleProvider 내에서만 사용해야 합니다."
    );
  }
  return context;
};

// Provider 컴포넌트
export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] =
    useState<SchedulseType>(dummyScheduleMap);

  return (
    <ScheduleStateContext.Provider value={schedulesMap}>
      <ScheduleActionsContext.Provider value={setSchedulesMap}>
        {children}
      </ScheduleActionsContext.Provider>
    </ScheduleStateContext.Provider>
  );
};
