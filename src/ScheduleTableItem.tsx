import { memo, useCallback } from "react";
import { useScheduleContext, useSchedules } from "./ScheduleContext.tsx"; // 🔥 useSchedules 훅 추가
import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";

interface SearchInfo {
  tableId: string;
  day?: string;
  time?: number;
}

type SearchClickEvent = string | SearchInfo;

interface ScheduleTableItemProps {
  tableId: string;
  index: number;
  onSearchClick: (searchData: SearchClickEvent) => void;
  onDuplicate: (tableId: string) => void;
  onRemove: (tableId: string) => void;
  disabledRemoveButton: boolean;
}

export const ScheduleTableItem = memo(
  ({
    tableId,
    index,
    onSearchClick,
    onDuplicate,
    onRemove,
    disabledRemoveButton,
  }: ScheduleTableItemProps) => {
    const schedules = useSchedules(tableId);
    const { removeSchedule } = useScheduleContext();

    const handleSearchClick = useCallback(() => {
      onSearchClick(tableId);
    }, [onSearchClick, tableId]);

    const handleDuplicate = useCallback(() => {
      onDuplicate(tableId);
    }, [onDuplicate, tableId]);

    const handleRemove = useCallback(() => {
      onRemove(tableId);
    }, [onRemove, tableId]);

    const handleScheduleTimeClick = useCallback(
      (timeInfo: { day: string; time: number }) => {
        onSearchClick({
          tableId,
          day: timeInfo.day,
          time: timeInfo.time,
        });
      },
      [onSearchClick, tableId]
    );

    const handleDeleteButtonClick = useCallback(
      ({ day, time }: { day: string; time: number }) => {
        removeSchedule(tableId, day, time);
      },
      [removeSchedule, tableId]
    );

    return (
      <Stack width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={handleSearchClick}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={handleDuplicate}>
              복제
            </Button>
            <Button
              colorScheme="green"
              isDisabled={disabledRemoveButton}
              onClick={handleRemove}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleTable
          key={`schedule-table-${index}`}
          schedules={schedules}
          tableId={tableId}
          onScheduleTimeClick={handleScheduleTimeClick}
          onDeleteButtonClick={handleDeleteButtonClick}
        />
      </Stack>
    );
  }
);
