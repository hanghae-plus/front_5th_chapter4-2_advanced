import { memo } from "react";
import { Flex, Heading, ButtonGroup, Button } from "@chakra-ui/react";

interface ScheduleTableHeaderProps {
  tableIndex: number;
  tableId: string;
  isRemoveDisabled: boolean;
  onAddSchedule: (tableId: string) => void;
  onDuplicate: (tableId: string) => void;
  onRemove: (tableId: string) => void;
}

const ScheduleTableHeader = memo(
  ({
    tableIndex,
    tableId,
    isRemoveDisabled,
    onAddSchedule,
    onDuplicate,
    onRemove,
  }: ScheduleTableHeaderProps) => {
    return (
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h3" fontSize="lg">
          시간표 {tableIndex + 1}
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
            isDisabled={isRemoveDisabled}
            onClick={() => onRemove(tableId)}
          >
            삭제
          </Button>
        </ButtonGroup>
      </Flex>
    );
  }
);

ScheduleTableHeader.displayName = "ScheduleTableHeader";

export default ScheduleTableHeader;
