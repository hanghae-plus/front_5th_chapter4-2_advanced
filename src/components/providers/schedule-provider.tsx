import dummyScheduleMap from "@/config/dummy-schedule-map";
import { ScheduleContext } from "@/contexts/schedule-context";
import { Schedule } from "@/types";
import { PropsWithChildren, useMemo, useState } from "react";

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>(dummyScheduleMap);
  const contextValue = useMemo(
    () => ({
      schedulesMap,
      setSchedulesMap,
    }),
    [schedulesMap, setSchedulesMap]
  );
  return <ScheduleContext.Provider value={contextValue}>{children}</ScheduleContext.Provider>;
};
