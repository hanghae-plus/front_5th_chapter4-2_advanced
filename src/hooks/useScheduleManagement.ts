import { useScheduleContext } from "@/contexts/ScheduleContext";
import { Lecture } from "@/types/types";
import { parseSchedule } from "@/utils/utils";
import { useCallback } from "react";

interface SearchInfo {
  tableId: string;
  day?: string;
  time?: number;
}

export const useScheduleManagement = (
  searchInfo?: SearchInfo | null,
  onClose?: () => void
) => {
  const { setSchedulesMap } = useScheduleContext();

  const addSchedule = useCallback(
    (lecture: Lecture) => {
      if (!searchInfo) return;

      const { tableId } = searchInfo;

      const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
        ...schedule,
        lecture,
      }));

      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: [...prev[tableId], ...schedules],
      }));

      onClose?.();
    },
    [searchInfo, setSchedulesMap, onClose]
  );

  return {
    addSchedule,
  };
};
