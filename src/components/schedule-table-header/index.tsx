import { useScheduleContext } from "@/hooks/use-schedule-context";
import { SearchInfo } from "@/types";
import { Button, ButtonGroup, Flex, Heading } from "@chakra-ui/react";
import { memo, useCallback } from "react";

type ScheduleTableHeaderProps = {
  tableId: string;
  index: number;
  isDisabled: boolean;
  setSearchInfo: React.Dispatch<React.SetStateAction<SearchInfo>>;
};

export const ScheduleTableHeader = ({ tableId, index, isDisabled, setSearchInfo }: ScheduleTableHeaderProps) => {
  const { setSchedulesMap } = useScheduleContext();

  const addClick = useCallback((tableId: string) => setSearchInfo((prev) => ({ ...prev, tableId })), [setSearchInfo]);

  const duplicate = useCallback(
    (targetId: string) =>
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      })),
    [setSchedulesMap]
  );

  const remove = useCallback(
    (targetId: string) =>
      setSchedulesMap((prev) => {
        delete prev[targetId];
        return { ...prev };
      }),
    [setSchedulesMap]
  );

  return (
    <HeaderFlex
      tableId={tableId}
      index={index}
      isDisabled={isDisabled}
      addClick={addClick}
      duplicate={duplicate}
      remove={remove}
    />
  );
};

type HeaderFlexProps = {
  tableId: string;
  index: number;
  isDisabled: boolean;
  addClick: (tableId: string) => void;
  duplicate: (targetId: string) => void;
  remove: (targetId: string) => void;
};

const HeaderFlex = memo(({ tableId, index, isDisabled, addClick, duplicate, remove }: HeaderFlexProps) => (
  <Flex justifyContent="space-between" alignItems="center">
    <Heading as="h3" fontSize="lg">
      시간표 {index + 1}
    </Heading>
    <ButtonGroup size="sm" isAttached>
      <Button colorScheme="green" onClick={() => addClick(tableId)}>
        시간표 추가
      </Button>
      <Button colorScheme="green" mx="1px" onClick={() => duplicate(tableId)}>
        복제
      </Button>
      <Button colorScheme="green" isDisabled={isDisabled} onClick={() => remove(tableId)}>
        삭제
      </Button>
    </ButtonGroup>
  </Flex>
));
