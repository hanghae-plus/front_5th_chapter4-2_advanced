import { memo } from "react";
import { Button, ButtonGroup, Flex, Heading } from "@chakra-ui/react";

import { useSetScheduleMap } from "./schedule/hooks/use-set-schedule-map";

interface ScheduleHeaderProps {
  index: number;
  tableId: string;
  setSearchInfo: React.Dispatch<
    React.SetStateAction<{
      tableId: string;
      day?: string;
      time?: number;
    } | null>
  >;

  disabledRemoveButton: boolean;
}

const ScheduleHeader = ({
  index,
  tableId,
  setSearchInfo,
  disabledRemoveButton,
}: ScheduleHeaderProps) => {
  const setSchedulesMap = useSetScheduleMap();

  const 시간표추가 = () => setSearchInfo({ tableId });

  const 복제 = () =>
    setSchedulesMap((prev) => ({
      ...prev,
      [`schedule-${Date.now()}`]: [...prev[tableId]],
    }));

  const 삭제 = () =>
    setSchedulesMap((prev) => {
      delete prev[tableId];
      return { ...prev };
    });

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Heading as="h3" fontSize="lg">
        시간표 {index + 1}
      </Heading>
      <ButtonGroup size="sm" isAttached>
        <Button colorScheme="green" onClick={시간표추가}>
          시간표 추가
        </Button>
        <Button colorScheme="green" mx="1px" onClick={복제}>
          복제
        </Button>
        <Button
          colorScheme="green"
          isDisabled={disabledRemoveButton}
          onClick={삭제}
        >
          삭제
        </Button>
      </ButtonGroup>
    </Flex>
  );
};

export default memo(ScheduleHeader);
