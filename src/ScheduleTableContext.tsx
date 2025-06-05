import { Schedule } from "./types";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

type Props = {
  schedules: Schedule[];
};

const ScheduleTableContext = createContext<Props>({ schedules: [] });

export const useScheduleTableContext = () => useContext(ScheduleTableContext);

export function ScheduleTableContextProvider({
  schedules,
  children,
}: PropsWithChildren<Props>) {
  const contextValue = useMemo(() => ({ schedules }), [schedules]);

  return (
    <ScheduleTableContext.Provider value={contextValue}>
      {children}
    </ScheduleTableContext.Provider>
  );
}
