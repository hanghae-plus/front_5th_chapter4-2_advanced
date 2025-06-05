import { memo, useCallback } from "react";
import { useScheduleContext, useSchedules } from "./ScheduleContext.tsx";
import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";
import { SearchClickEvent } from "./ScheduleTables.tsx"; // 🔥 타입 import

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
    // 🔥 특정 테이블의 스케줄만 구독 (다른 테이블 변경 시 리렌더링 방지)
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
          schedules={schedules}
          tableId={tableId}
          onScheduleTimeClick={handleScheduleTimeClick}
          onDeleteButtonClick={handleDeleteButtonClick}
        />
      </Stack>
    );
  }
);
