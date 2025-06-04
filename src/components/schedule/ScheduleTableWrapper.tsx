import { memo, useCallback } from "react";
import { Stack, Flex, Heading, ButtonGroup, Button } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable";
import { useScheduleStore } from "../../stores/scheduleStore";

interface ScheduleTableWrapperProps {
  tableId: string;
  index: number;
  disabledRemoveButton: boolean;
  onSearchInfo: (searchInfo: { tableId: string }) => void;
  onScheduleTimeClick: (tableId: string, timeInfo: { day: string; time: number }) => void;
  onDeleteSchedule: (tableId: string, day: string, time: number) => void;
}

const ScheduleTableWrapper = memo(
  ({
    tableId,
    index,
    disabledRemoveButton,
    onSearchInfo,
    onScheduleTimeClick,
    onDeleteSchedule,
  }: ScheduleTableWrapperProps) => {
    const { duplicateTable, removeTable } = useScheduleStore();

    const handleDuplicate = useCallback(() => {
      duplicateTable(tableId);
    }, [duplicateTable, tableId]);

    const handleRemove = useCallback(() => {
      removeTable(tableId);
    }, [removeTable, tableId]);

    const handleSearchInfo = useCallback(() => {
      onSearchInfo({ tableId });
    }, [onSearchInfo, tableId]);

    const handleScheduleTimeClick = useCallback(
      (timeInfo: { day: string; time: number }) => {
        onScheduleTimeClick(tableId, timeInfo);
      },
      [onScheduleTimeClick, tableId]
    );

    const handleDeleteSchedule = useCallback(
      ({ day, time }: { day: string; time: number }) => {
        onDeleteSchedule(tableId, day, time);
      },
      [onDeleteSchedule, tableId]
    );

    return (
      <Stack key={tableId} width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={handleSearchInfo}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={handleDuplicate}>
              복제
            </Button>
            <Button colorScheme="green" isDisabled={disabledRemoveButton} onClick={handleRemove}>
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleTable
          tableId={tableId}
          onScheduleTimeClick={handleScheduleTimeClick}
          onDeleteButtonClick={handleDeleteSchedule}
        />
      </Stack>
    );
  }
);

ScheduleTableWrapper.displayName = "ScheduleTableWrapper";

export default ScheduleTableWrapper;
