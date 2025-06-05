import { LocalScheduleContext, LocalScheduleContextType } from "@/contexts/local-schedule-context";
import { PropsWithChildren, useMemo } from "react";

export const LocalScheduleProvider = ({
  tableId,
  schedules,
  handleScheduleTimeClick,
  handleDeleteButtonClick,
  children,
}: PropsWithChildren<LocalScheduleContextType>) => {
  const contextValue = useMemo(
    () => ({
      tableId,
      schedules,
      handleScheduleTimeClick,
      handleDeleteButtonClick,
    }),
    [tableId, schedules, handleScheduleTimeClick, handleDeleteButtonClick]
  );
  return <LocalScheduleContext.Provider value={contextValue}>{children}</LocalScheduleContext.Provider>;
};
