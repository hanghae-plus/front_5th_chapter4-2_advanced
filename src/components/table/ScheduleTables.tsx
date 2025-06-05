import { Flex, Stack } from "@chakra-ui/react";
import ScheduleTable from "@/components/table/ScheduleTable.tsx";
import SearchDialog from "@/components/dialog/SearchDialog";
import { useScheduleContext } from "@/contexts/ScheduleContext.tsx";
import { useCallback, useState } from "react";
import ScheduleTableHeader from "./ScheduleTableHeader";

export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const handleAddSchedule = useCallback((tableId: string) => {
    setSearchInfo({ tableId });
  }, []);

  const handleDuplicate = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      }));
    },
    [setSchedulesMap]
  );

  const handleRemove = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => {
        delete prev[targetId];
        return { ...prev };
      });
    },
    [setSchedulesMap]
  );

  const handleScheduleTimeClick = useCallback(
    (tableId: string, timeInfo: { day: string; time: number }) => {
      setSearchInfo({ tableId, ...timeInfo });
    },
    []
  );

  const handleDeleteSchedule = useCallback(
    (tableId: string, day: string, time: number) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: prev[tableId].filter(
          (schedule) => schedule.day !== day || !schedule.range.includes(time)
        ),
      }));
    },
    [setSchedulesMap]
  );

  const handleCloseSearch = useCallback(() => {
    setSearchInfo(null);
  }, []);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <Stack key={tableId} width="600px">
            <ScheduleTableHeader
              tableIndex={index}
              tableId={tableId}
              isRemoveDisabled={disabledRemoveButton}
              onAddSchedule={handleAddSchedule}
              onDuplicate={handleDuplicate}
              onRemove={handleRemove}
            />
            <ScheduleTable
              key={`schedule-table-${index}`}
              schedules={schedules}
              tableId={tableId}
              onScheduleTimeClick={(timeInfo) =>
                handleScheduleTimeClick(tableId, timeInfo)
              }
              onDeleteButtonClick={({ day, time }) =>
                handleDeleteSchedule(tableId, day, time)
              }
            />
          </Stack>
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleCloseSearch} />
    </>
  );
};
