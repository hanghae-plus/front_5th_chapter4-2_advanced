import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";
import { useScheduleState, useScheduleActions } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useCallback, useState, memo } from "react";

interface ScheduleTablesProps {
  activeTableId: string | null;
}

export const ScheduleTables = memo(({ activeTableId }: ScheduleTablesProps) => {
  const schedulesMap = useScheduleState();
  const setSchedulesMap = useScheduleActions();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const duplicate = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      }));
    },
    [setSchedulesMap]
  );

  const remove = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[targetId];
        return newMap;
      });
    },
    [setSchedulesMap]
  );

  const openDialog = useCallback(
    (tableId: string, day?: string, time?: number) => {
      setSearchInfo({ tableId, day, time });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setSearchInfo(null);
  }, []);

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

  const renderScheduleStack = (
    tableId: string,
    schedules: (typeof schedulesMap)[string],
    index: number
  ) => (
    <Stack key={tableId} width="600px">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h3" fontSize="lg">
          시간표 {index + 1}
        </Heading>
        <ButtonGroup size="sm" isAttached>
          <Button colorScheme="green" onClick={() => openDialog(tableId)}>
            시간표 추가
          </Button>
          <Button
            colorScheme="green"
            mx="1px"
            onClick={() => duplicate(tableId)}
          >
            복제
          </Button>
          <Button
            colorScheme="green"
            isDisabled={disabledRemoveButton}
            onClick={() => remove(tableId)}
          >
            삭제
          </Button>
        </ButtonGroup>
      </Flex>
      <ScheduleTable
        key={`schedule-table-${index}`}
        schedules={schedules}
        tableId={tableId}
        activeTableId={activeTableId}
        onScheduleTimeClick={({ day, time }) => openDialog(tableId, day, time)}
        onDeleteButtonClick={({ day, time }) =>
          handleDeleteSchedule(tableId, day, time)
        }
      />
    </Stack>
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) =>
          renderScheduleStack(tableId, schedules, index)
        )}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={closeDialog} />
    </>
  );
});
