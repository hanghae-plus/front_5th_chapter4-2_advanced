import { memo } from "react";
import ScheduleTable from "./../ScheduleTable.tsx";
import { Schedule } from "./../types.ts";
import { Stack, Flex, Button, ButtonGroup, Heading } from "@chakra-ui/react";

interface Props {
  tableId: string;
  schedules: Schedule[];
  index: number;
  onScheduleTimeClick: (info: { day: string; time: number }) => void;
  onDeleteButtonClick: (info: { day: string; time: number }) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  isRemoveDisabled: boolean;
  onAdd: () => void;
}

const MemoizedScheduleTable = memo(
  ({
    tableId,
    schedules,
    index,
    onScheduleTimeClick,
    onDeleteButtonClick,
    onDuplicate,
    onRemove,
    isRemoveDisabled,
    onAdd,
  }: Props) => {
    return (
      <Stack key={tableId} width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>

          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={onAdd}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={onDuplicate}>
              복제
            </Button>
            <Button
              colorScheme="green"
              isDisabled={isRemoveDisabled}
              onClick={onRemove}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleTable
          schedules={schedules}
          tableId={tableId}
          onScheduleTimeClick={onScheduleTimeClick}
          onDeleteButtonClick={onDeleteButtonClick}
        />
      </Stack>
    );
  },
  (prev, next) => {
    return prev.tableId === next.tableId && prev.schedules === next.schedules;
  }
);

export default MemoizedScheduleTable;