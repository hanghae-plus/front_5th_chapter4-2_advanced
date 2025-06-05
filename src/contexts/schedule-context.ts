import { Schedule } from "@/types";
import React, { createContext } from "react";

export interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;
  setSchedulesMap: React.Dispatch<React.SetStateAction<Record<string, Schedule[]>>>;
}

export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);
