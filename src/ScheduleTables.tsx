import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";
import {
  useSchedulesMap,
  useSchedulesMapDispatch,
} from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useState, useCallback, memo } from "react";
import { Schedule } from "./types.ts";

interface TableHeaderProps {
  index: number;
  tableId: string;
  onDuplicate: (tableId: string) => void;
  onRemove: (tableId: string) => void;
  onAddSchedule: (tableId: string) => void;
  disabledRemoveButton: boolean;
}

const TableHeader = memo(
  ({
    index,
    tableId,
    onDuplicate,
    onRemove,
    onAddSchedule,
    disabledRemoveButton,
  }: TableHeaderProps) => (
    <Flex justifyContent="space-between" alignItems="center">
      <Heading as="h3" fontSize="lg">
        시간표 {index + 1}
      </Heading>
      <ButtonGroup size="sm" isAttached>
        <Button colorScheme="green" onClick={() => onAddSchedule(tableId)}>
          시간표 추가
        </Button>
        <Button
          colorScheme="green"
          mx="1px"
          onClick={() => onDuplicate(tableId)}
        >
          복제
        </Button>
        <Button
          colorScheme="green"
          isDisabled={disabledRemoveButton}
          onClick={() => onRemove(tableId)}
        >
          삭제
        </Button>
      </ButtonGroup>
    </Flex>
  )
);

interface ScheduleTableWrapperProps {
  tableId: string;
  schedules: Schedule[];
  index: number;
  onScheduleTimeClick: (
    timeInfo: { day: string; time: number },
    tableId: string
  ) => void;
  onDeleteButtonClick: (
    timeInfo: { day: string; time: number },
    tableId: string
  ) => void;
}

const ScheduleTableWrapper = memo(
  ({
    tableId,
    schedules,
    index,
    onScheduleTimeClick,
    onDeleteButtonClick,
  }: ScheduleTableWrapperProps) => (
    <ScheduleTable
      key={`schedule-table-${index}`}
      schedules={schedules}
      tableId={tableId}
      onScheduleTimeClick={(timeInfo) => onScheduleTimeClick(timeInfo, tableId)}
      onDeleteButtonClick={(timeInfo) => onDeleteButtonClick(timeInfo, tableId)}
    />
  )
);

export const ScheduleTables = () => {
  const { schedulesMap } = useSchedulesMap();
  const { setSchedulesMap } = useSchedulesMapDispatch();
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

  const handleScheduleTimeClick = useCallback(
    (timeInfo: { day: string; time: number }, tableId: string) => {
      setSearchInfo({ tableId, ...timeInfo });
    },
    []
  );

  const handleDeleteButtonClick = useCallback(
    ({ day, time }: { day: string; time: number }, tableId: string) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: prev[tableId].filter(
          (schedule) => schedule.day !== day || !schedule.range.includes(time)
        ),
      }));
    },
    [setSchedulesMap]
  );

  const handleSearchDialogClose = useCallback(() => {
    setSearchInfo(null);
  }, []);

  const handleAddSchedule = useCallback((tableId: string) => {
    setSearchInfo({ tableId });
  }, []);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <Stack key={tableId} width="600px">
            <TableHeader
              index={index}
              tableId={tableId}
              onDuplicate={duplicate}
              onRemove={remove}
              onAddSchedule={handleAddSchedule}
              disabledRemoveButton={disabledRemoveButton}
            />
            <ScheduleTableWrapper
              tableId={tableId}
              schedules={schedules}
              index={index}
              onScheduleTimeClick={handleScheduleTimeClick}
              onDeleteButtonClick={handleDeleteButtonClick}
            />
          </Stack>
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleSearchDialogClose} />
    </>
  );
};
