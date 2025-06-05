import { memo, useCallback } from "react";
import { Stack } from "@chakra-ui/react";
import ScheduleTableHeader from "./ScheduleTableHeader";
import ScheduleTableBody from "./ScheduleTableBody";
import { useScheduleContext } from "@/providers/ScheduleContext";
import type { Schedule } from "@/types";

interface ScheduleTableProps {
  tableId: string;
  schedules: Schedule[];
  index: number;
  isActive: boolean;
  disabledRemoveButton: boolean;
  setSearchInfo: React.Dispatch<
    React.SetStateAction<{
      tableId: string;
      day?: string;
      time?: number;
    } | null>
  >;
}

const ScheduleTable = ({
  tableId,
  schedules,
  index,
  isActive,
  disabledRemoveButton,
  setSearchInfo,
}: ScheduleTableProps) => {
  const { setSchedulesMap } = useScheduleContext();

  const handleAddScheduleClick = useCallback(
    (tableId: string) => {
      setSearchInfo((prev) => ({ ...prev, tableId }));
    },
    [setSearchInfo],
  );

  const handleDuplicateScheduleClick = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      }));
    },
    [setSchedulesMap],
  );

  const handleRemoveScheduleClick = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => {
        delete prev[targetId];
        return { ...prev };
      });
    },
    [setSchedulesMap],
  );

  const handleScheduleTimeClick = useCallback(
    (tableId: string, timeInfo: { day: string; time: number }) => {
      setSearchInfo({ tableId, ...timeInfo });
    },
    [setSearchInfo],
  );

  const handleDeleteButtonClick = useCallback(
    (tableId: string, timeInfo: { day: string; time: number }) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: prev[tableId].filter(
          (schedule) =>
            schedule.day !== timeInfo.day ||
            !schedule.range.includes(timeInfo.time),
        ),
      }));
    },
    [setSchedulesMap],
  );

  return (
    <Stack
      key={tableId}
      width="600px">
      <ScheduleTableHeader
        index={index}
        tableId={tableId}
        disabledRemoveButton={disabledRemoveButton}
        onAddScheduleClick={handleAddScheduleClick}
        onDuplicateScheduleClick={handleDuplicateScheduleClick}
        onRemoveScheduleClick={handleRemoveScheduleClick}
      />
      <ScheduleTableBody
        key={`schedule-table-${index}`}
        schedules={schedules}
        tableId={tableId}
        isActive={isActive}
        onScheduleTimeClick={handleScheduleTimeClick}
        onDeleteButtonClick={handleDeleteButtonClick}
      />
    </Stack>
  );
};

export default memo(ScheduleTable);
