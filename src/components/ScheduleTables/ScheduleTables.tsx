import { Flex, Stack } from "@chakra-ui/react";
import { ScheduleTable, ScheduleTableHeader } from "../ScheduleTable";
import { useScheduleContext } from "@/providers/ScheduleContext";
import { SearchDialog } from "@/components/SearchDialog";
import { useCallback, useMemo, useState } from "react";
import { useDndContext } from "@dnd-kit/core";

const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = useMemo(() => {
    return Object.keys(schedulesMap).length === 1;
  }, [schedulesMap]);
  const { active } = useDndContext();

  const activeTableId = useMemo(() => {
    const activeId = active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  }, [active]);

  const handleAddScheduleClick = useCallback((tableId: string) => {
    setSearchInfo((prev) => ({ ...prev, tableId }));
  }, []);

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
    [],
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
    <>
      <Flex
        w="full"
        gap={6}
        p={6}
        flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
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
            <ScheduleTable
              key={`schedule-table-${index}`}
              schedules={schedules}
              tableId={tableId}
              isActive={activeTableId === tableId}
              onScheduleTimeClick={handleScheduleTimeClick}
              onDeleteButtonClick={handleDeleteButtonClick}
            />
          </Stack>
        ))}
      </Flex>
      <SearchDialog
        searchInfo={searchInfo}
        onClose={() => setSearchInfo(null)}
      />
    </>
  );
};

export default ScheduleTables;
