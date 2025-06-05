import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";
import { useScheduleContext } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { memo, useCallback, useMemo, useState } from "react";
import { useDndContext } from "@dnd-kit/core";
import { Schedule } from "./types.ts";

const ScheduleTableItem = memo(
  ({
    tableId,
    schedules,
    index,
    onSearchClick,
    onDuplicateClick,
    onRemoveClick,
    onScheduleTimeClick,
    onDeleteButtonClick,
    isRemoveDisabled,
  }: {
    tableId: string;
    schedules: Schedule[];
    index: number;
    onSearchClick: () => void;
    onDuplicateClick: () => void;
    onRemoveClick: () => void;
    onScheduleTimeClick: (timeInfo: { day: string; time: number }) => void;
    onDeleteButtonClick: (timeInfo: { day: string; time: number }) => void;
    isRemoveDisabled: boolean;
  }) => {
    const dndContext = useDndContext();

    const isActive = useMemo(() => {
      const activeId = dndContext.active?.id;
      if (activeId) {
        return String(activeId).split(":")[0] === tableId;
      }
      return false;
    }, [dndContext.active?.id, tableId]);

    return (
      <Stack width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={onSearchClick}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={onDuplicateClick}>
              복제
            </Button>
            <Button
              colorScheme="green"
              isDisabled={isRemoveDisabled}
              onClick={onRemoveClick}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleTable
          schedules={schedules}
          tableId={tableId}
          isActive={isActive}
          onScheduleTimeClick={onScheduleTimeClick}
          onDeleteButtonClick={onDeleteButtonClick}
        />
      </Stack>
    );
  }
);

export const ScheduleTables = memo(() => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const duplicate = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      }));
    },
    [setSchedulesMap]
  );

  const remove = useCallback(
    (targetId: string) => {
      setSchedulesMap((prev) => {
        delete prev[targetId];
        return { ...prev };
      });
    },
    [setSchedulesMap]
  );

  const handleSearchClick = useCallback((tableId: string) => {
    setSearchInfo({ tableId });
  }, []);

  const handleScheduleTimeClick = useCallback(
    (tableId: string) => (timeInfo: { day: string; time: number }) => {
      setSearchInfo({ tableId, ...timeInfo });
    },
    []
  );

  const handleDeleteButtonClick = useCallback(
    (tableId: string) =>
      ({ day, time }: { day: string; time: number }) => {
        setSchedulesMap((prev) => ({
          ...prev,
          [tableId]: prev[tableId].filter(
            (schedule) => schedule.day !== day || !schedule.range.includes(time)
          ),
        }));
      },
    [setSchedulesMap]
  );

  const handleDuplicateButtonClick = useCallback(
    (tableId: string) => () => duplicate(tableId),
    [duplicate]
  );

  const handleRemoveClick = useCallback(
    (tableId: string) => () => remove(tableId),
    [remove]
  );

  const handleSearchDialogClose = useCallback(() => {
    setSearchInfo(null);
  }, []);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <ScheduleTableItem
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            index={index}
            onSearchClick={() => handleSearchClick(tableId)}
            onDuplicateClick={handleDuplicateButtonClick(tableId)}
            onRemoveClick={handleRemoveClick(tableId)}
            onScheduleTimeClick={handleScheduleTimeClick(tableId)}
            onDeleteButtonClick={handleDeleteButtonClick(tableId)}
            isRemoveDisabled={disabledRemoveButton}
          />
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleSearchDialogClose} />
    </>
  );
});
