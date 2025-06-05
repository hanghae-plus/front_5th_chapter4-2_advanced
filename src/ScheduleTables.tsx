import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useScheduleContext } from "./ScheduleContext.tsx";
import ScheduleTable from "./ScheduleTable.tsx";
import SearchDialog from "./SearchDialog.tsx";

export const ScheduleTables = () => {
  const { schedulesMap, updateSchedulesByTableId } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const duplicate = useCallback(
    (targetId: string) => {
      const newTableId = `schedule-${Date.now()}`;
      const schedulesToDuplicate = schedulesMap[targetId] || [];
      updateSchedulesByTableId(newTableId, [...schedulesToDuplicate]);
    },
    [schedulesMap, updateSchedulesByTableId]
  );

  const remove = useCallback(
    (targetId: string) => {
      const newSchedulesMap = { ...schedulesMap };
      delete newSchedulesMap[targetId];

      Object.entries(newSchedulesMap).forEach(([tableId, schedules]) => {
        updateSchedulesByTableId(tableId, schedules);
      });
    },
    [schedulesMap, updateSchedulesByTableId]
  );

  const handleDeleteSchedule = useCallback(
    (tableId: string, day: string, time: number) => {
      const currentSchedules = schedulesMap[tableId] || [];
      const updatedSchedules = currentSchedules.filter(
        (schedule) => schedule.day !== day || !schedule.range.includes(time)
      );
      updateSchedulesByTableId(tableId, updatedSchedules);
    },
    [schedulesMap, updateSchedulesByTableId]
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId], index) => (
          <Stack key={tableId} width="600px">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading as="h3" fontSize="lg">
                시간표 {index + 1}
              </Heading>
              <ButtonGroup size="sm" isAttached>
                <Button
                  colorScheme="green"
                  onClick={() => setSearchInfo({ tableId })}>
                  시간표 추가
                </Button>
                <Button
                  colorScheme="green"
                  mx="1px"
                  onClick={() => duplicate(tableId)}>
                  복제
                </Button>
                <Button
                  colorScheme="green"
                  isDisabled={disabledRemoveButton}
                  onClick={() => remove(tableId)}>
                  삭제
                </Button>
              </ButtonGroup>
            </Flex>
            <ScheduleTable
              key={`schedule-table-${index}`}
              tableId={tableId}
              onScheduleTimeClick={(timeInfo) =>
                setSearchInfo({ tableId, ...timeInfo })
              }
              onDeleteButtonClick={({ day, time }) =>
                handleDeleteSchedule(tableId, day, time)
              }
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
