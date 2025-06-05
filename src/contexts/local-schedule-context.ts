import { DayTime, Schedule } from "@/types.ts";
import { createContext } from "react";

// 테이블별 local schedules Context 함수
export type LocalScheduleContextType = {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick: (timeInfo: DayTime) => void;
  onDeleteButtonClick: (timeInfo: DayTime) => void;
};

export const LocalScheduleContext = createContext<LocalScheduleContextType>({
  tableId: "",
  schedules: [],
  onScheduleTimeClick: () => {},
  onDeleteButtonClick: () => {},
});
