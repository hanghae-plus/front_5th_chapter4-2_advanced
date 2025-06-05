import { LocalScheduleContext, LocalScheduleContextType } from "@/contexts/local-schedule-context";
import { PropsWithChildren, useMemo } from "react";

export const LocalScheduleProvider = ({
  tableId,
  schedules,
  onScheduleTimeClick,
  onDeleteButtonClick,
  children,
}: PropsWithChildren<LocalScheduleContextType>) => {
  const contextValue = useMemo(
    () => ({
      tableId,
      schedules,
      onScheduleTimeClick,
      onDeleteButtonClick,
    }),
    [tableId, schedules, onScheduleTimeClick, onDeleteButtonClick]
  );
  return <LocalScheduleContext.Provider value={contextValue}>{children}</LocalScheduleContext.Provider>;
};
