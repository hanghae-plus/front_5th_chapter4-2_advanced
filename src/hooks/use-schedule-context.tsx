import { ScheduleContext } from "@/contexts/schedule-context";
import { useContext } from "react";

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};
