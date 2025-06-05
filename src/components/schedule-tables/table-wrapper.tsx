import { LocalScheduleProvider } from "@/components/providers/local-schedule-provider";
import ScheduleTable from "@/components/schedule-table";
import { DayTime, Schedule } from "@/types";
import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { memo } from "react";

type TableWrapperProps = {
  tableId: string;
  index: number;
  schedules: Schedule[];
  isDeletable: boolean;
  isActive: boolean;
  handleAddClick: () => void;
  handleDuplicateClick: () => void;
  handleDeleteClick: () => void;
  handleScheduleTimeClick: (timeInfo: DayTime) => void;
  handleDeleteButtonClick: (timeInfo: DayTime) => void;
};
export const TableWrapper = memo(
  ({
    tableId,
    index,
    schedules,
    isDeletable,
    isActive,
    handleAddClick,
    handleDuplicateClick,
    handleDeleteClick,
    handleScheduleTimeClick,
    handleDeleteButtonClick,
  }: TableWrapperProps) => {
    return (
      <Stack width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={handleAddClick}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={handleDuplicateClick}>
              복제
            </Button>
            <Button colorScheme="green" isDisabled={isDeletable} onClick={handleDeleteClick}>
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <LocalScheduleProvider // table 별 Local Context API 로 재할당
          tableId={tableId}
          schedules={schedules}
          onScheduleTimeClick={handleScheduleTimeClick}
          onDeleteButtonClick={handleDeleteButtonClick}
        >
          <ScheduleTable key={`schedule-table-${index}`} isActive={isActive} />
        </LocalScheduleProvider>
      </Stack>
    );
  }
);
