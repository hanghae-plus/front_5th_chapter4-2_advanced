import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { Schedule } from '../types';
import dummyScheduleMap from '../data/dummyScheduleMap.ts';

// 상태만 관리하는 Context
const ScheduleStateContext = createContext<Record<string, Schedule[]> | undefined>(undefined);
// 액션만 관리하는 Context
const ScheduleActionsContext = createContext<
  React.Dispatch<React.SetStateAction<Record<string, Schedule[]>>> | undefined
>(undefined);

// 커스텀 훅
export const useScheduleState = () => {
  const context = useContext(ScheduleStateContext);
  if (context === undefined) {
    throw new Error('useScheduleState must be used within a ScheduleProvider');
  }
  return context;
};

export const useScheduleActions = () => {
  const context = useContext(ScheduleActionsContext);
  if (context === undefined) {
    throw new Error('useScheduleActions must be used within a ScheduleProvider');
  }
  return context;
};

// Provider 분리
export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>(dummyScheduleMap);

  return (
    <ScheduleStateContext.Provider value={schedulesMap}>
      <ScheduleActionsContext.Provider value={setSchedulesMap}>
        {children}
      </ScheduleActionsContext.Provider>
    </ScheduleStateContext.Provider>
  );
};
