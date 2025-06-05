import { DayTime, Schedule } from "@/types";
import { createContext } from "react";

// 테이블별 local schedules Context 함수
export type LocalScheduleContextType = {
  tableId: string;
  schedules: Schedule[];
  handleScheduleTimeClick: (timeInfo: DayTime) => void;
  handleDeleteButtonClick: (timeInfo: DayTime) => void;
};

export const LocalScheduleContext = createContext<LocalScheduleContextType>({
  tableId: "",
  schedules: [],
  handleScheduleTimeClick: () => {},
  handleDeleteButtonClick: () => {},
});
