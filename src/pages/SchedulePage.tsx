import { Flex } from "@chakra-ui/react";
import { useState, memo, useCallback } from "react";
import { useScheduleStore } from "../stores/scheduleStore";
import { ScheduleTableWrapper } from "../components/schedule";
import { SearchDialog } from "../components/search";

export const SchedulePage = memo(() => {
  const { schedulesMap, removeSchedule } = useScheduleStore();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const handleSearchInfo = useCallback((searchInfo: { tableId: string }) => {
    setSearchInfo(searchInfo);
  }, []);

  const handleScheduleTimeClick = useCallback((tableId: string, timeInfo: { day: string; time: number }) => {
    setSearchInfo({ tableId, ...timeInfo });
  }, []);

  const handleDeleteSchedule = useCallback(
    (tableId: string, day: string, time: number) => {
      removeSchedule(tableId, day, time);
    },
    [removeSchedule]
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId], index) => (
          <ScheduleTableWrapper
            key={tableId}
            tableId={tableId}
            index={index}
            disabledRemoveButton={disabledRemoveButton}
            onSearchInfo={handleSearchInfo}
            onScheduleTimeClick={handleScheduleTimeClick}
            onDeleteSchedule={handleDeleteSchedule}
          />
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
});

SchedulePage.displayName = "SchedulePage";
