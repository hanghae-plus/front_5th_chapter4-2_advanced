import { Button, ButtonGroup, Flex, Heading } from "@chakra-ui/react";
import { memo } from "react";

interface ScheduleTableHeaderProps {
  index: number;
  tableId: string;
  disabledRemoveButton: boolean;
  onAddScheduleClick: (tableId: string) => void;
  onDuplicateScheduleClick: (tableId: string) => void;
  onRemoveScheduleClick: (tableId: string) => void;
}

const ScheduleTableHeader = ({
  index,
  tableId,
  disabledRemoveButton,
  onAddScheduleClick,
  onDuplicateScheduleClick,
  onRemoveScheduleClick,
}: ScheduleTableHeaderProps) => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center">
      <Heading
        as="h3"
        fontSize="lg">
        시간표 {index + 1}
      </Heading>
      <ButtonGroup
        size="sm"
        isAttached>
        <Button
          colorScheme="green"
          onClick={() => onAddScheduleClick(tableId)}>
          시간표 추가
        </Button>
        <Button
          colorScheme="green"
          mx="1px"
          onClick={() => onDuplicateScheduleClick(tableId)}>
          복제
        </Button>
        <Button
          colorScheme="green"
          isDisabled={disabledRemoveButton}
          onClick={() => onRemoveScheduleClick(tableId)}>
          삭제
        </Button>
      </ButtonGroup>
    </Flex>
  );
};

export default memo(ScheduleTableHeader);
