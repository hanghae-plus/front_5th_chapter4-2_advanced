import { LocalScheduleContext } from "@/contexts/local-schedule-context";
import { useContext } from "react";

export const useLocalScheduleContext = () => {
  const context = useContext(LocalScheduleContext);
  if (context === undefined) {
    throw new Error("useLocalSchedule must be used within a LocalScheduleProvider");
  }
  return context;
};
