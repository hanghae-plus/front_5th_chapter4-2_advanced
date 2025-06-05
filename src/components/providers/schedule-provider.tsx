import dummyScheduleMap from "@/config/dummy-schedule-map";
import { ScheduleContext } from "@/contexts/schedule-context";
import { Schedule } from "@/types";
import { PropsWithChildren, useMemo, useState } from "react";

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>(dummyScheduleMap);
  const tmp = useMemo(() => ({ ...schedulesMap }), [schedulesMap]);
  return <ScheduleContext.Provider value={{ schedulesMap: tmp, setSchedulesMap }}>{children}</ScheduleContext.Provider>;
};
