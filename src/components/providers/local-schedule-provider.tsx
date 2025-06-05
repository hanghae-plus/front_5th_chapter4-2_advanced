import { LocalScheduleContext, LocalScheduleContextType } from "@/contexts/local-schedule-context";
import { PropsWithChildren, useMemo } from "react";

export const LocalScheduleProvider = ({
  tableId,
  schedules,
  handleAddClick,
  handleDuplicateClick,
  handleDeleteClick,
  handleScheduleTimeClick,
  handleDeleteButtonClick,
  children,
}: PropsWithChildren<LocalScheduleContextType>) => {
  const contextValue = useMemo(
    () => ({
      tableId,
      schedules,
      handleAddClick,
      handleDuplicateClick,
      handleDeleteClick,
      handleScheduleTimeClick,
      handleDeleteButtonClick,
    }),
    [
      tableId,
      schedules,
      handleAddClick,
      handleDuplicateClick,
      handleDeleteClick,
      handleScheduleTimeClick,
      handleDeleteButtonClick,
    ]
  );
  return <LocalScheduleContext.Provider value={contextValue}>{children}</LocalScheduleContext.Provider>;
};
