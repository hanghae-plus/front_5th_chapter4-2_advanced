import { memo, useCallback } from "react";
import { useSearchStore } from "../store/searchStore.ts";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { Schedule } from "../types.ts";

interface ScheduleButtonGroupProps {
  tableId: string;
  scheduleCount: number;
  setSchedulesMap: React.Dispatch<
    React.SetStateAction<Record<string, Schedule[]>>
  >;
}

const ScheduleButtonGroup = memo(
  ({ tableId, scheduleCount, setSchedulesMap }: ScheduleButtonGroupProps) => {
    const { setSearchInfo } = useSearchStore();

    const handleScheduleAddClick = useCallback(() => {
      setSearchInfo({ tableId });
    }, [setSearchInfo, tableId]);

    const handleScheduleDuplicateClick = useCallback(() => {
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[tableId]],
      }));
    }, [setSchedulesMap, tableId]);

    const isDisabledRemoveButton = scheduleCount === 1;

    const handleScheduleRemoveClick = useCallback(() => {
      setSchedulesMap((prev) => {
        delete prev[tableId];
        return { ...prev };
      });
    }, [setSchedulesMap, tableId]);

    return (
      <ButtonGroup size="sm" isAttached>
        <Button colorScheme="green" onClick={handleScheduleAddClick}>
          시간표 추가
        </Button>
        <Button
          colorScheme="green"
          mx="1px"
          onClick={handleScheduleDuplicateClick}
        >
          복제
        </Button>
        <Button
          colorScheme="green"
          isDisabled={isDisabledRemoveButton}
          onClick={handleScheduleRemoveClick}
        >
          삭제
        </Button>
      </ButtonGroup>
    );
  }
);

export default ScheduleButtonGroup;
